import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  exchangeOAuthCode,
  decodeOAuthState,
  OAUTH_STATE_COOKIE,
  getOAuthAppBaseUrl,
  type OAuthProvider,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google", "facebook"];

function errorRedirect(baseUrl: string, message: string): NextResponse {
  const url = new URL("/login", baseUrl);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url.toString());
}

/**
 * GET /api/auth/oauth/[provider]/callback
 *
 * Handles the OAuth callback:
 *  1. Verifies state cookie (CSRF check)
 *  2. Exchanges authorization code for user info
 *  3. Finds or creates a User record
 *  4. Issues JWT session cookie
 *  5. Redirects to returnUrl
 */
export async function GET(request: NextRequest, context: ApiRouteContext) {
  const params = await context.params;
  const provider = (Array.isArray(params.provider) ? params.provider[0] : params.provider) as
    | OAuthProvider
    | undefined;

  const appBase = getOAuthAppBaseUrl();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return errorRedirect(appBase, "Unsupported login provider");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateFromQuery = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return errorRedirect(appBase, oauthError === "access_denied" ? "Login was cancelled" : "OAuth error");
  }

  if (!code) {
    return errorRedirect(appBase, "Missing authorization code");
  }

  // ── CSRF state verification (cookie must match provider-returned `state` param) ─
  const cookieState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
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

  const returnUrl = stateObj.returnUrl || "/";

  // ── Exchange code for user info ──────────────────────────────────────────
  let oauthUser;
  try {
    oauthUser = await exchangeOAuthCode(provider, code);
  } catch (e) {
    console.error(`[OAuth] ${provider} code exchange failed:`, e);
    return errorRedirect(appBase, "Failed to authenticate with " + provider);
  }

  if (!oauthUser.email) {
    return errorRedirect(appBase, "Your " + provider + " account has no email address. Use a different sign-in method.");
  }

  // ── Find or create user ──────────────────────────────────────────────────
  let user = await prisma.user.findFirst({
    where: { email: oauthUser.email, deletedAt: null },
    select: { id: true, email: true, firstName: true, lastName: true, emailVerified: true },
  });

  if (user) {
    // Link OAuth provider if not already set, and ensure emailVerified
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
  } else {
    // Create new user — no password (OAuth-only)
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
      select: { id: true, email: true, firstName: true, lastName: true, emailVerified: true },
    });
  }

  // ── Issue JWT session ────────────────────────────────────────────────────
  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const response = NextResponse.redirect(new URL(returnUrl, appBase).toString());
  setAuthCookie(response, token);

  // Clear the state cookie
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });

  return response;
}
