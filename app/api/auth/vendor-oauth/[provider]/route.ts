import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  buildOAuthAuthUrl,
  generateOAuthState,
  encodeOAuthState,
  OAUTH_STATE_COOKIE,
  VENDOR_OAUTH_STATE_COOKIE,
  getOAuthAppBaseUrl,
  isOAuthClientConfigured,
  resolveOAuthBaseUrlFromRequest,
  type OAuthProvider,
} from "@/lib/auth/oauth";
import { copyVendorAppContextParams } from "@/lib/vendor-app-query";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google"];

/**
 * GET /api/auth/vendor-oauth/[provider]?returnUrl=/vendor
 *
 * Starts Google OAuth for vendor (Seller) sign-in.
 * Uses the same Google redirect_uri as customer login
 * (`/api/auth/oauth/google/callback`) — that URI is registered in Google Cloud.
 * Vendor completion is selected via OAuth state `flow: "vendor"`.
 */
export async function GET(request: NextRequest, context: ApiRouteContext) {
  const params = await context.params;
  const provider = (Array.isArray(params.provider) ? params.provider[0] : params.provider) as
    | OAuthProvider
    | undefined;

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);

  if (!isOAuthClientConfigured(provider)) {
    const login = new URL("/vendor/login", getOAuthAppBaseUrl());
    login.searchParams.set(
      "error",
      "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment."
    );
    copyVendorAppContextParams(searchParams, login.searchParams);
    return NextResponse.redirect(login.toString());
  }

  const returnUrl = searchParams.get("returnUrl") ?? "/vendor";
  let effectiveReturnUrl = returnUrl;
  if (searchParams.get("app") && !returnUrl.includes("app=")) {
    const sep = returnUrl.includes("?") ? "&" : "?";
    effectiveReturnUrl = `${returnUrl}${sep}app=${encodeURIComponent(searchParams.get("app")!)}`;
    if (searchParams.get("v")) {
      effectiveReturnUrl += `&v=${encodeURIComponent(searchParams.get("v")!)}`;
    }
  }

  // Native app starts sign-in in ASWebAuthenticationSession / Chrome Custom Tabs;
  // the session cookie can't reach the WebView, so complete via one-time hand-off.
  const isNative = searchParams.get("native") === "1";
  const stateObj = generateOAuthState(effectiveReturnUrl, "vendor", isNative);
  const stateStr = encodeOAuthState(stateObj);

  const oauthBaseUrl = resolveOAuthBaseUrlFromRequest(request);
  // Auth URL still tagged as vendor for logging; Google redirect_uri is shared.
  const authUrl = buildOAuthAuthUrl(provider, stateStr, oauthBaseUrl, "vendor");

  const response = NextResponse.redirect(authUrl);
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  };
  // Shared callback reads OAUTH_STATE_COOKIE.
  response.cookies.set(OAUTH_STATE_COOKIE, stateStr, cookieOpts);
  // Keep vendor cookie too for the legacy vendor callback path if still hit.
  response.cookies.set(VENDOR_OAUTH_STATE_COOKIE, stateStr, cookieOpts);

  return response;
}
