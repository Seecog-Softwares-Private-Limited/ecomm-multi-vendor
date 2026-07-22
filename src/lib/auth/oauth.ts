/**
 * OAuth 2.0 utilities for Google and Facebook social login.
 *
 * Environment variables:
 *   Google:   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   Facebook: FACEBOOK_APP_ID + FACEBOOK_APP_SECRET
 *             (aliases: FACEBOOK_CLIENT_ID + FACEBOOK_CLIENT_SECRET)
 *   APP_URL / NEXT_PUBLIC_APP_URL — used to build redirect_uri
 */

import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";

export type OAuthProvider = "google" | "facebook";

export type OAuthFlow = "customer" | "vendor";

/** Meta App ID — supports FACEBOOK_APP_ID or FACEBOOK_CLIENT_ID. */
export function getFacebookAppId(): string {
  return (
    process.env.FACEBOOK_APP_ID?.trim() ||
    process.env.FACEBOOK_CLIENT_ID?.trim() ||
    ""
  );
}

/** Meta App Secret — supports FACEBOOK_APP_SECRET or FACEBOOK_CLIENT_SECRET. */
export function getFacebookAppSecret(): string {
  return (
    process.env.FACEBOOK_APP_SECRET?.trim() ||
    process.env.FACEBOOK_CLIENT_SECRET?.trim() ||
    ""
  );
}

export interface OAuthUserInfo {
  providerId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Public origin for OAuth redirect_uri. Must match exactly what is registered
 * in Google Cloud Console and Facebook Login (including port on localhost).
 * Prefer explicit APP_URL / NEXT_PUBLIC_APP_URL; otherwise http://localhost:$PORT
 * when PORT is set (e.g. node app.js dev with PORT=3005).
 */
function appUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  const port = process.env.PORT?.replace(/\D/g, "") || "3000";
  return `http://localhost:${port}`;
}

export function getOAuthAppBaseUrl(): string {
  return appUrl();
}

/**
 * Origin used for OAuth redirect_uri and callback redirects.
 * Must match the browser tab that started sign-in or the oauth_state cookie
 * will not be sent back (causing "Missing OAuth state").
 */
export function resolveOAuthBaseUrlFromRequest(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (request.nextUrl.protocol.replace(":", "") || "http");
  const requestOrigin = `${proto === "https" ? "https" : "http"}://${host}`.replace(
    /\/$/,
    ""
  );

  const isLocalRequest =
    /^localhost(:\d+)?$/i.test(host) ||
    /^127\.0\.0\.1(:\d+)?$/i.test(host) ||
    /^10\.0\.2\.2(:\d+)?$/i.test(host);

  // Local dev: always use the tab origin (e.g. http://localhost:3005), not APP_URL production URL.
  if (isLocalRequest) {
    return requestOrigin;
  }

  const configured = appUrl();
  if (configured) {
    try {
      const configuredHost = new URL(configured).host;
      if (configuredHost === host) {
        return configured.replace(/\/$/, "");
      }
    } catch {
      return configured.replace(/\/$/, "");
    }
  }

  return requestOrigin;
}

export function oauthRedirectUri(
  provider: OAuthProvider,
  baseUrl?: string,
  flow: OAuthFlow = "customer"
): string {
  const origin = (baseUrl?.trim() || appUrl()).replace(/\/$/, "");
  const prefix = flow === "vendor" ? "/api/auth/vendor-oauth" : "/api/auth/oauth";
  return `${origin}${prefix}/${provider}/callback`;
}

export function isOAuthClientConfigured(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
    );
  }
  if (provider === "facebook") {
    return Boolean(getFacebookAppId() && getFacebookAppSecret());
  }
  return false;
}

// ─── State cookie (CSRF protection) ──────────────────────────────────────────

export const OAUTH_STATE_COOKIE = "oauth_state";
export const VENDOR_OAUTH_STATE_COOKIE = "vendor_oauth_state";

export interface OAuthState {
  state: string;
  returnUrl: string;
}

export function generateOAuthState(returnUrl: string): OAuthState {
  return { state: randomBytes(16).toString("hex"), returnUrl };
}

export function encodeOAuthState(s: OAuthState): string {
  return Buffer.from(JSON.stringify(s)).toString("base64url");
}

export function decodeOAuthState(raw: string): OAuthState | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8"));
    if (
      parsed &&
      typeof parsed.state === "string" &&
      typeof parsed.returnUrl === "string"
    ) {
      return parsed as OAuthState;
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Google ───────────────────────────────────────────────────────────────────

export function googleAuthUrl(
  stateStr: string,
  baseUrl?: string,
  flow: OAuthFlow = "customer"
): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: oauthRedirectUri("google", baseUrl, flow),
    response_type: "code",
    scope: "openid email profile",
    state: stateStr,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  baseUrl?: string,
  flow: OAuthFlow = "customer"
): Promise<OAuthUserInfo> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: oauthRedirectUri("google", baseUrl, flow),
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const tokens = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokens.access_token) {
    throw new Error(`Google did not return an access token: ${JSON.stringify(tokens)}`);
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) throw new Error("Failed to fetch Google user info");

  const u = (await userRes.json()) as {
    sub?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };

  if (!u.sub || !u.email) throw new Error("Google did not return required user fields");

  return {
    providerId: u.sub,
    email: u.email,
    firstName: u.given_name ?? null,
    lastName: u.family_name ?? null,
    avatarUrl: u.picture ?? null,
  };
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

export function facebookAuthUrl(stateStr: string, baseUrl?: string): string {
  const params = new URLSearchParams({
    client_id: getFacebookAppId(),
    redirect_uri: oauthRedirectUri("facebook", baseUrl),
    state: stateStr,
    scope: "email,public_profile",
    response_type: "code",
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeFacebookCode(code: string, baseUrl?: string): Promise<OAuthUserInfo> {
  const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", getFacebookAppId());
  tokenUrl.searchParams.set("client_secret", getFacebookAppSecret());
  tokenUrl.searchParams.set("redirect_uri", oauthRedirectUri("facebook", baseUrl));
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) {
    const err = await tokenRes.text().catch(() => "");
    throw new Error(`Facebook token exchange failed: ${err}`);
  }

  const tokens = (await tokenRes.json()) as { access_token?: string; error?: { message: string } };
  if (!tokens.access_token) {
    throw new Error(`Facebook did not return an access token`);
  }

  const infoUrl = new URL("https://graph.facebook.com/me");
  infoUrl.searchParams.set("fields", "id,first_name,last_name,email,picture.type(large)");
  infoUrl.searchParams.set("access_token", tokens.access_token);

  const userRes = await fetch(infoUrl.toString());
  if (!userRes.ok) throw new Error("Failed to fetch Facebook user info");

  const u = (await userRes.json()) as {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    picture?: { data?: { url?: string } };
  };

  if (!u.id) throw new Error("Facebook did not return required user fields");

  return {
    providerId: u.id,
    email: u.email ?? "",
    firstName: u.first_name ?? null,
    lastName: u.last_name ?? null,
    avatarUrl: u.picture?.data?.url ?? null,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function buildOAuthAuthUrl(
  provider: OAuthProvider,
  stateStr: string,
  baseUrl?: string,
  flow: OAuthFlow = "customer"
): string {
  if (provider === "google") return googleAuthUrl(stateStr, baseUrl, flow);
  if (provider === "facebook") return facebookAuthUrl(stateStr, baseUrl);
  throw new Error(`Unsupported provider: ${provider}`);
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
  baseUrl?: string,
  flow: OAuthFlow = "customer"
): Promise<OAuthUserInfo> {
  if (provider === "google") return exchangeGoogleCode(code, baseUrl, flow);
  if (provider === "facebook") return exchangeFacebookCode(code, baseUrl);
  throw new Error(`Unsupported provider: ${provider}`);
}
