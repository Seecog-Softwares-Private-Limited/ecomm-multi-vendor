import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  exchangeOAuthCode,
  decodeOAuthState,
  OAUTH_STATE_COOKIE,
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  validateOAuthCallbackState,
  oauthStateErrorMessage,
  type OAuthProvider,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { queueGoogleOAuthWelcomeEmail } from "@/lib/email/oauth-google-welcome";
import { prisma } from "@/lib/prisma";
import { userNeedsProfileCompletion } from "@/lib/profile/needs-completion";
import {
  completeVendorGoogleOAuth,
  vendorErrorRedirect,
} from "@/lib/auth/complete-vendor-google-oauth";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google", "facebook"];

function errorRedirect(baseUrl: string, message: string): NextResponse {
  const url = new URL("/login", baseUrl);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url.toString());
}

/**
 * GET /api/auth/oauth/[provider]/callback
 *
 * Shared Google redirect URI for customer + vendor (registered in Google Cloud).
 * Vendor sessions are selected when OAuth state has `flow: "vendor"`.
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

  const stateObjEarly = stateFromQuery ? decodeOAuthState(stateFromQuery) : null;
  const isVendorFlow = stateObjEarly?.flow === "vendor";

  if (oauthError) {
    if (isVendorFlow) {
      return vendorErrorRedirect(
        appBase,
        oauthError === "access_denied" ? "Login was cancelled" : "OAuth error",
        stateObjEarly?.returnUrl
      );
    }
    return errorRedirect(
      appBase,
      oauthError === "access_denied" ? "Login was cancelled" : "OAuth error"
    );
  }

  if (!code) {
    if (isVendorFlow) {
      return vendorErrorRedirect(
        appBase,
        "Missing authorization code",
        stateObjEarly?.returnUrl
      );
    }
    return errorRedirect(appBase, "Missing authorization code");
  }

  const stateValidation = validateOAuthCallbackState(request, stateFromQuery);
  if (!stateValidation.ok) {
    const message = oauthStateErrorMessage(stateValidation.reason);
    if (isVendorFlow) {
      return vendorErrorRedirect(appBase, message, stateObjEarly?.returnUrl);
    }
    return errorRedirect(appBase, message);
  }

  const stateObj = stateValidation.state;

  if (stateObj.flow === "vendor") {
    return completeVendorGoogleOAuth({
      provider,
      code,
      requestBase,
      appBase,
      returnUrl: stateObj.returnUrl || "/vendor",
      native: stateObj.native === true,
    });
  }

  const returnUrl = stateObj.returnUrl || "/";

  let oauthUser;
  try {
    oauthUser = await exchangeOAuthCode(provider, code, requestBase);
  } catch (e) {
    console.error(`[OAuth] ${provider} code exchange failed:`, e);
    return errorRedirect(appBase, "Failed to authenticate with " + provider);
  }

  if (!oauthUser.email) {
    return errorRedirect(
      appBase,
      "Your " + provider + " account has no email address. Use a different sign-in method."
    );
  }

  let isNewUser = false;

  let user = await prisma.user.findFirst({
    where: { email: oauthUser.email, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      phone: true,
      profileCompleted: true,
    },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        oauthProvider: provider,
        oauthProviderId: oauthUser.providerId,
        avatarUrl: oauthUser.avatarUrl ?? undefined,
        firstName: user.firstName ?? oauthUser.firstName ?? undefined,
        lastName: user.lastName ?? oauthUser.lastName ?? undefined,
      },
    });
    user = await prisma.user.findFirst({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        phone: true,
        profileCompleted: true,
      },
    });
  } else {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        email: oauthUser.email,
        passwordHash: null,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        emailVerified: true,
        oauthProvider: provider,
        oauthProviderId: oauthUser.providerId,
        avatarUrl: oauthUser.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        phone: true,
        profileCompleted: true,
      },
    });
  }

  if (!user) {
    return errorRedirect(appBase, "Could not create your account. Please try again.");
  }

  if (provider === "google" && isNewUser) {
    queueGoogleOAuthWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
    });
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const destination = userNeedsProfileCompletion({
    phone: user.phone,
    profileCompleted: user.profileCompleted,
  })
    ? "/complete-profile"
    : returnUrl;

  const response = NextResponse.redirect(new URL(destination, appBase).toString());
  setAuthCookie(response, token);
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });

  return response;
}
