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
import { setAuthCookie } from "@/lib/auth";
import { completeCustomerSocialLogin } from "@/lib/auth/complete-customer-google";
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
 *
 * Customer identity resolution (Phase 2):
 * 1. Lookup by (oauthProvider, oauthProviderId) first
 * 2. If found → login that User (never rewrite identity onto another account)
 * 3. If not found and email belongs to another User → conflict (no auto-merge)
 * 4. Else create incomplete User (passwordHash=null, phoneVerified=false)
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

  const result = await completeCustomerSocialLogin(provider, {
    providerId: oauthUser.providerId,
    email: oauthUser.email,
    firstName: oauthUser.firstName,
    lastName: oauthUser.lastName,
    avatarUrl: oauthUser.avatarUrl,
  });

  if (!result.ok) {
    return errorRedirect(appBase, result.error);
  }

  // Incomplete until phone OTP (and any other onboarding fields) are satisfied.
  const destination =
    !result.user.authOnboardingComplete || !result.user.phoneVerified
      ? "/complete-profile"
      : returnUrl;

  const response = NextResponse.redirect(new URL(destination, appBase).toString());
  setAuthCookie(response, result.token);
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });

  return response;
}
