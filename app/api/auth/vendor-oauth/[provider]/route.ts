import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  buildOAuthAuthUrl,
  generateOAuthState,
  encodeOAuthState,
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
  // When the hybrid app starts OAuth, keep app=1 on the post-login destination.
  let effectiveReturnUrl = returnUrl;
  if (searchParams.get("app") && !returnUrl.includes("app=")) {
    const sep = returnUrl.includes("?") ? "&" : "?";
    effectiveReturnUrl = `${returnUrl}${sep}app=${encodeURIComponent(searchParams.get("app")!)}`;
    if (searchParams.get("v")) {
      effectiveReturnUrl += `&v=${encodeURIComponent(searchParams.get("v")!)}`;
    }
  }

  const stateObj = generateOAuthState(effectiveReturnUrl);
  const stateStr = encodeOAuthState(stateObj);

  const oauthBaseUrl = resolveOAuthBaseUrlFromRequest(request);
  const authUrl = buildOAuthAuthUrl(provider, stateStr, oauthBaseUrl, "vendor");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(VENDOR_OAUTH_STATE_COOKIE, stateStr, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
