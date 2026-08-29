import { NextResponse } from "next/server";
import {
  exchangeOAuthCode,
  OAUTH_STATE_COOKIE,
  VENDOR_OAUTH_STATE_COOKIE,
  type OAuthProvider,
  type OAuthUserInfo,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function vendorErrorRedirect(
  baseUrl: string,
  message: string,
  returnUrl?: string
): NextResponse {
  const url = new URL("/vendor/login", baseUrl);
  url.searchParams.set("error", message);
  if (returnUrl) {
    url.searchParams.set("callbackUrl", returnUrl);
    try {
      const ret = new URL(returnUrl, baseUrl);
      const app = ret.searchParams.get("app");
      const v = ret.searchParams.get("v");
      if (app) url.searchParams.set("app", app);
      if (v) url.searchParams.set("v", v);
    } catch {
      /* ignore */
    }
  }
  return NextResponse.redirect(url.toString());
}

function clearOAuthStateCookies(response: NextResponse): void {
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(VENDOR_OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
}

/**
 * Completes vendor Google OAuth after Google redirects to the shared
 * `/api/auth/oauth/google/callback` (registered in Google Cloud Console).
 */
export async function completeVendorGoogleOAuth(opts: {
  provider: OAuthProvider;
  code: string;
  requestBase: string;
  appBase: string;
  returnUrl: string;
  oauthUser?: OAuthUserInfo;
}): Promise<NextResponse> {
  const { provider, code, requestBase, appBase, returnUrl } = opts;

  let oauthUser = opts.oauthUser;
  if (!oauthUser) {
    try {
      // Use "customer" redirect_uri path (shared with customer Google login).
      oauthUser = await exchangeOAuthCode(provider, code, requestBase, "customer");
    } catch (e) {
      console.error(`[Vendor OAuth] ${provider} code exchange failed:`, e);
      return vendorErrorRedirect(appBase, "Failed to authenticate with Google", returnUrl);
    }
  }

  if (!oauthUser.email) {
    return vendorErrorRedirect(
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
    return vendorErrorRedirect(
      appBase,
      "No vendor account exists for this Google email. Register as a vendor first.",
      returnUrl
    );
  }

  try {
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
  } catch (e) {
    // oauthProvider columns may be missing on older DBs — still issue session.
    console.error("[Vendor OAuth] seller OAuth link update failed (non-fatal):", e);
  }

  const token = await signToken({
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const dest = new URL(returnUrl || "/vendor", appBase);
  if (!dest.searchParams.has("app") && returnUrl.includes("app=")) {
    try {
      const fromReturn = new URL(returnUrl, appBase);
      const app = fromReturn.searchParams.get("app");
      if (app) dest.searchParams.set("app", app);
      const v = fromReturn.searchParams.get("v");
      if (v) dest.searchParams.set("v", v);
    } catch {
      /* ignore */
    }
  }

  const response = NextResponse.redirect(dest.toString());
  setAuthCookie(response, token);
  clearOAuthStateCookies(response);
  return response;
}

export { vendorErrorRedirect };
