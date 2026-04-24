/**
 * OAuth 2.0 utilities for Google and Facebook social login.
 *
 * Environment variables required:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   FACEBOOK_APP_ID, FACEBOOK_APP_SECRET
 *   APP_URL  (used to build the redirect_uri)
 */

import { randomBytes } from "crypto";

export type OAuthProvider = "google" | "facebook";

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

export function oauthRedirectUri(provider: OAuthProvider): string {
  return `${appUrl()}/api/auth/oauth/${provider}/callback`;
}

export function isOAuthClientConfigured(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
    );
  }
  if (provider === "facebook") {
    return Boolean(
      process.env.FACEBOOK_APP_ID?.trim() && process.env.FACEBOOK_APP_SECRET?.trim()
    );
  }
  return false;
}

// ─── State cookie (CSRF protection) ──────────────────────────────────────────

export const OAUTH_STATE_COOKIE = "oauth_state";

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

export function googleAuthUrl(stateStr: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: oauthRedirectUri("google"),
    response_type: "code",
    scope: "openid email profile",
    state: stateStr,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<OAuthUserInfo> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: oauthRedirectUri("google"),
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

export function facebookAuthUrl(stateStr: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID ?? "",
    redirect_uri: oauthRedirectUri("facebook"),
    state: stateStr,
    scope: "email,public_profile",
    response_type: "code",
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeFacebookCode(code: string): Promise<OAuthUserInfo> {
  const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID ?? "");
  tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET ?? "");
  tokenUrl.searchParams.set("redirect_uri", oauthRedirectUri("facebook"));
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

export function buildOAuthAuthUrl(provider: OAuthProvider, stateStr: string): string {
  if (provider === "google") return googleAuthUrl(stateStr);
  if (provider === "facebook") return facebookAuthUrl(stateStr);
  throw new Error(`Unsupported provider: ${provider}`);
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string
): Promise<OAuthUserInfo> {
  if (provider === "google") return exchangeGoogleCode(code);
  if (provider === "facebook") return exchangeFacebookCode(code);
  throw new Error(`Unsupported provider: ${provider}`);
}
