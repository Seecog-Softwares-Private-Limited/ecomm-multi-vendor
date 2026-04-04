import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  buildOAuthAuthUrl,
  generateOAuthState,
  encodeOAuthState,
  OAUTH_STATE_COOKIE,
  type OAuthProvider,
} from "@/lib/auth/oauth";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google", "facebook"];

/**
 * GET /api/auth/oauth/[provider]?returnUrl=/...
 *
 * Redirects the user to the OAuth provider's authorization page.
 * Stores a signed state value in a short-lived cookie for CSRF protection.
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
  const returnUrl = searchParams.get("returnUrl") ?? "/";

  const stateObj = generateOAuthState(returnUrl);
  const stateStr = encodeOAuthState(stateObj);

  const authUrl = buildOAuthAuthUrl(provider, stateStr);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, stateStr, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes — enough to complete the OAuth flow
    path: "/",
  });

  return response;
}
