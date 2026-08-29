import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  validateOAuthCallbackState,
  oauthStateErrorMessage,
  type OAuthProvider,
} from "@/lib/auth/oauth";
import {
  completeVendorGoogleOAuth,
  vendorErrorRedirect,
} from "@/lib/auth/complete-vendor-google-oauth";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google"];

/**
 * Legacy vendor callback path.
 * New vendor Google logins use the shared `/api/auth/oauth/google/callback`
 * (registered in Google Cloud). This route remains for older in-flight states.
 */
export async function GET(request: NextRequest, context: ApiRouteContext) {
  const params = await context.params;
  const provider = (Array.isArray(params.provider) ? params.provider[0] : params.provider) as
    | OAuthProvider
    | undefined;

  const requestBase = resolveOAuthBaseUrlFromRequest(request);
  const appBase = requestBase || getOAuthAppBaseUrl();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return vendorErrorRedirect(appBase, "Unsupported login provider");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateFromQuery = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return vendorErrorRedirect(
      appBase,
      oauthError === "access_denied" ? "Login was cancelled" : "OAuth error"
    );
  }

  if (!code) {
    return vendorErrorRedirect(appBase, "Missing authorization code");
  }

  const stateValidation = validateOAuthCallbackState(request, stateFromQuery);
  if (!stateValidation.ok) {
    return vendorErrorRedirect(appBase, oauthStateErrorMessage(stateValidation.reason));
  }

  const stateObj = stateValidation.state;

  return completeVendorGoogleOAuth({
    provider,
    code,
    requestBase,
    appBase,
    returnUrl: stateObj.returnUrl || "/vendor",
  });
}
