import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  exchangeOAuthCode,
  decodeOAuthState,
  VENDOR_OAUTH_STATE_COOKIE,
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  type OAuthProvider,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google"];

function errorRedirect(baseUrl: string, message: string, returnUrl?: string): NextResponse {
  const url = new URL("/vendor/login", baseUrl);
  url.searchParams.set("error", message);
  if (returnUrl) {
    url.searchParams.set("callbackUrl", returnUrl);
  }
  return NextResponse.redirect(url.toString());
}

/**
 * GET /api/auth/vendor-oauth/[provider]/callback
 *
 * Completes vendor Google OAuth: finds Seller by email, links provider, issues SELLER session.
 */
export async function GET(request: NextRequest, context: ApiRouteContext) {
  const params = await context.params;
  const provider = (Array.isArray(params.provider) ? params.provider[0] : params.provider) as
    | OAuthProvider
    | undefined;

  const requestBase = resolveOAuthBaseUrlFromRequest(request);
  const appBase = requestBase || getOAuthAppBaseUrl();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return errorRedirect(appBase, "Unsupported login provider");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateFromQuery = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return errorRedirect(
      appBase,
      oauthError === "access_denied" ? "Login was cancelled" : "OAuth error"
    );
  }

  if (!code) {
    return errorRedirect(appBase, "Missing authorization code");
  }

  const cookieState = request.cookies.get(VENDOR_OAUTH_STATE_COOKIE)?.value;
  if (!cookieState || !stateFromQuery) {
    return errorRedirect(appBase, "Missing OAuth state — please try again");
  }

  if (cookieState !== stateFromQuery) {
    return errorRedirect(appBase, "Invalid OAuth state — please start sign-in again");
  }

  const stateObj = decodeOAuthState(stateFromQuery);
  if (!stateObj) {
    return errorRedirect(appBase, "Invalid OAuth state — please start sign-in again");
  }

  const returnUrl = stateObj.returnUrl || "/vendor";

  let oauthUser;
  try {
    oauthUser = await exchangeOAuthCode(provider, code, requestBase, "vendor");
  } catch (e) {
    console.error(`[Vendor OAuth] ${provider} code exchange failed:`, e);
    return errorRedirect(appBase, "Failed to authenticate with Google", returnUrl);
  }

  if (!oauthUser.email) {
    return errorRedirect(
      appBase,
      "Your Google account has no email address. Use email and password instead.",
      returnUrl
    );
  }

  const seller = await prisma.seller.findFirst({
    where: { email: oauthUser.email, deletedAt: null },
    select: {
      id: true,
      email: true,
      businessName: true,
      ownerName: true,
      status: true,
    },
  });

  if (!seller) {
    return errorRedirect(
      appBase,
      "No vendor account exists for this Google email. Register as a vendor first.",
      returnUrl
    );
  }

  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      emailVerified: true,
      oauthProvider: provider,
      oauthProviderId: oauthUser.providerId,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  const token = await signToken({
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const response = NextResponse.redirect(new URL(returnUrl, appBase).toString());
  setAuthCookie(response, token);
  response.cookies.set(VENDOR_OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });

  return response;
}
