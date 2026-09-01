/**
 * OAuth 2.0 utilities for Google and Facebook social login.
 *
 * Environment variables:
 *   Google:   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   Facebook: FACEBOOK_APP_ID + FACEBOOK_APP_SECRET
 *             (aliases: FACEBOOK_CLIENT_ID + FACEBOOK_CLIENT_SECRET)
 *   APP_URL / NEXT_PUBLIC_APP_URL — used to build redirect_uri
 */

import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { authConfig } from "./config";

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
 * Must match the browser tab that started sign-in when using legacy unsigned state.
 * Signed OAuth state (HMAC) validates without the cookie — required for vendor hybrid
 * apps where WebView and Chrome Custom Tabs use separate cookie stores.
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

  // Production: always use the configured public URL so Google sees one stable
  // redirect_uri (avoids www vs apex and http vs https mismatches).
  const configured = appUrl();
  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }

  return requestOrigin;
}

export function oauthRedirectUri(
  provider: OAuthProvider,
  baseUrl?: string,
  _flow: OAuthFlow = "customer"
): string {
  const origin = (baseUrl?.trim() || appUrl()).replace(/\/$/, "");
  // Google Cloud OAuth clients usually register a single web redirect URI.
  // Customer + vendor Google login share `/api/auth/oauth/google/callback`;
  // vendor vs customer is distinguished via OAuth state `flow`.
  if (provider === "google") {
    return `${origin}/api/auth/oauth/google/callback`;
  }
  const prefix = _flow === "vendor" ? "/api/auth/vendor-oauth" : "/api/auth/oauth";
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

/** Matches cookie maxAge on OAuth start routes. */
export const OAUTH_STATE_TTL_MS = 600_000;

export interface OAuthState {
  state: string;
  returnUrl: string;
  /** Defaults to customer when omitted (legacy state cookies). */
  flow?: OAuthFlow;
  /**
   * True when sign-in was started from the native app via
   * ASWebAuthenticationSession / Chrome Custom Tabs. The auth session runs in
   * a browser whose cookie store is NOT shared with the app WebView, so the
   * session must be handed back to the WebView via a one-time token instead of
   * setting the auth cookie in the browser store.
   */
  native?: boolean;
}

interface SignedOAuthPayload extends OAuthState {
  exp: number;
}

function oauthStateSecret(): string {
  return (
    process.env.OAUTH_STATE_SECRET?.trim() ||
    authConfig.jwtSecret ||
    "dev-oauth-state-change-me"
  );
}

function signOAuthStateBody(body: string): string {
  return createHmac("sha256", oauthStateSecret()).update(body).digest("base64url");
}

function parseOAuthStateFields(parsed: unknown): OAuthState | null {
  if (
    parsed &&
    typeof parsed === "object" &&
    typeof (parsed as SignedOAuthPayload).state === "string" &&
    typeof (parsed as SignedOAuthPayload).returnUrl === "string"
  ) {
    const flow =
      (parsed as SignedOAuthPayload).flow === "vendor" ||
      (parsed as SignedOAuthPayload).flow === "customer"
        ? ((parsed as SignedOAuthPayload).flow as OAuthFlow)
        : "customer";
    return {
      state: (parsed as SignedOAuthPayload).state,
      returnUrl: (parsed as SignedOAuthPayload).returnUrl,
      flow,
      native: (parsed as SignedOAuthPayload).native === true,
    };
  }
  return null;
}

export function generateOAuthState(
  returnUrl: string,
  flow: OAuthFlow = "customer",
  native = false
): OAuthState {
  return { state: randomBytes(16).toString("hex"), returnUrl, flow, native };
}

// ─── Native session hand-off token ───────────────────────────────────────────
//
// When the native app runs Google OAuth in ASWebAuthenticationSession / Chrome
// Custom Tabs, the resulting session cookie lands in the system browser's cookie
// store — not the app WebView. We therefore mint a short-lived, HMAC-signed
// hand-off token, return it to the app via the custom-scheme callback, and the
// app loads it into the WebView (native-complete route) so the auth cookie is
// finally set in the WebView's own cookie store.

/** Short lifetime — the app redeems it immediately after the auth session closes. */
export const VENDOR_HANDOFF_TTL_MS = 120_000;

interface VendorHandoffPayload {
  sub: string;
  email: string;
  exp: number;
}

export function signVendorNativeHandoff(input: { sub: string; email: string }): string {
  const payload: VendorHandoffPayload = {
    sub: input.sub,
    email: input.email,
    exp: Date.now() + VENDOR_HANDOFF_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signOAuthStateBody(body);
  return `${body}.${sig}`;
}

export function verifyVendorNativeHandoff(
  raw: string
): { sub: string; email: string } | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0 || dot >= raw.length - 1) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = signOAuthStateBody(body);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as VendorHandoffPayload;
    if (typeof parsed?.exp !== "number" || parsed.exp < Date.now()) return null;
    if (typeof parsed.sub !== "string" || typeof parsed.email !== "string") return null;
    return { sub: parsed.sub, email: parsed.email };
  } catch {
    return null;
  }
}

/** HMAC-signed state — verifiable without the oauth_state cookie (hybrid WebView + CCT). */
export function encodeOAuthState(s: OAuthState): string {
  const payload: SignedOAuthPayload = {
    ...s,
    exp: Date.now() + OAUTH_STATE_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signOAuthStateBody(body);
  return `${body}.${sig}`;
}

export function decodeOAuthState(raw: string): OAuthState | null {
  if (!raw) return null;

  const dot = raw.indexOf(".");
  if (dot > 0 && dot < raw.length - 1) {
    const body = raw.slice(0, dot);
    const sig = raw.slice(dot + 1);
    const expected = signOAuthStateBody(body);
    if (sig.length !== expected.length) return null;
    try {
      if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    } catch {
      return null;
    }
    try {
      const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
      if (typeof parsed?.exp === "number" && parsed.exp < Date.now()) return null;
      return parseOAuthStateFields(parsed);
    } catch {
      return null;
    }
  }

  // Legacy unsigned state (in-flight sessions during deploy) — requires cookie match.
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8"));
    return parseOAuthStateFields(parsed);
  } catch {
    return null;
  }
}

export type OAuthStateValidation =
  | { ok: true; state: OAuthState }
  | { ok: false; reason: "missing" | "invalid" | "mismatch" };

/**
 * Validates OAuth callback `state` query param.
 * Signed state (HMAC) is accepted without cookie — required for Android vendor app
 * where WebView and Chrome Custom Tabs do not share the oauth_state cookie.
 * Cookie match is still required when present (defense in depth).
 */
export function validateOAuthCallbackState(
  request: NextRequest,
  stateFromQuery: string | null
): OAuthStateValidation {
  if (!stateFromQuery) return { ok: false, reason: "missing" };

  const state = decodeOAuthState(stateFromQuery);
  if (!state) return { ok: false, reason: "invalid" };

  const cookieState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const isSignedEnvelope = stateFromQuery.includes(".");

  if (isSignedEnvelope) {
    if (cookieState && cookieState !== stateFromQuery) {
      return { ok: false, reason: "mismatch" };
    }
    return { ok: true, state };
  }

  if (!cookieState) return { ok: false, reason: "missing" };
  if (cookieState !== stateFromQuery) return { ok: false, reason: "mismatch" };
  return { ok: true, state };
}

export function oauthStateErrorMessage(
  reason: "missing" | "invalid" | "mismatch"
): string {
  if (reason === "missing") return "Missing OAuth state — please try again";
  return "Invalid OAuth state — please start sign-in again";
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
