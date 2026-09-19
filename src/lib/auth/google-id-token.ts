/**
 * Verify Google ID tokens from native apps (Flutter google_sign_in).
 * Audience allow-list: web + Android (+ iOS) OAuth client IDs.
 */

import * as jose from "jose";

export const GOOGLE_ISSUERS = [
  "https://accounts.google.com",
  "accounts.google.com",
] as const;

export const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

export class GoogleAuthError extends Error {
  readonly code: string;

  constructor(message: string, code = "GOOGLE_AUTH_FAILED") {
    super(message);
    this.name = "GoogleAuthError";
    this.code = code;
  }
}

export interface GoogleIdentityClaims {
  sub: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  iss: string;
  aud: string;
}

export type GoogleJwtVerifyKey = jose.JWTVerifyGetKey | jose.KeyLike | Uint8Array;

let remoteJwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

function getGoogleJwks(): ReturnType<typeof jose.createRemoteJWKSet> {
  if (!remoteJwks) {
    remoteJwks = jose.createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  }
  return remoteJwks;
}

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

/** Allowed `aud` values for native / web Google ID tokens. */
export function getGoogleIdTokenAudiences(): string[] {
  const ids = [
    trimEnv("GOOGLE_CLIENT_ID"),
    trimEnv("GOOGLE_ANDROID_CLIENT_ID"),
    trimEnv("GOOGLE_IOS_CLIENT_ID"),
  ].filter((v): v is string => Boolean(v));
  return [...new Set(ids)];
}

export function isGoogleIdTokenAuthConfigured(): boolean {
  return getGoogleIdTokenAudiences().length > 0;
}

function claimIsTrue(value: unknown): boolean {
  return value === true || value === "true";
}

/**
 * Cryptographically verify a Google ID token.
 * `key` is injectable for unit tests; production uses Google's JWKS.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  options: {
    audiences?: string[];
    key?: GoogleJwtVerifyKey;
    now?: Date;
  } = {}
): Promise<GoogleIdentityClaims> {
  const token = idToken?.trim();
  if (!token) {
    throw new GoogleAuthError("Missing Google ID token", "GOOGLE_TOKEN_MISSING");
  }

  const audiences = (options.audiences ?? getGoogleIdTokenAudiences()).filter(Boolean);
  if (audiences.length === 0) {
    throw new GoogleAuthError(
      "Google sign-in is not configured on the server",
      "GOOGLE_NOT_CONFIGURED"
    );
  }

  const key = options.key ?? getGoogleJwks();

  let payload: jose.JWTPayload;
  try {
    const verified =
      typeof key === "function"
        ? await jose.jwtVerify(token, key, {
            issuer: [...GOOGLE_ISSUERS],
            audience: audiences,
            clockTolerance: 5,
            currentDate: options.now,
          })
        : await jose.jwtVerify(token, key as jose.KeyLike | Uint8Array, {
            issuer: [...GOOGLE_ISSUERS],
            audience: audiences,
            clockTolerance: 5,
            currentDate: options.now,
          });
    payload = verified.payload;
  } catch (err) {
    if (err instanceof GoogleAuthError) throw err;
    const code =
      err instanceof jose.errors.JWTExpired
        ? "GOOGLE_TOKEN_EXPIRED"
        : err instanceof jose.errors.JWTClaimValidationFailed
          ? "GOOGLE_TOKEN_CLAIMS"
          : "GOOGLE_TOKEN_INVALID";
    throw new GoogleAuthError("Google sign-in could not be verified. Please try again.", code);
  }

  const sub = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!sub) {
    throw new GoogleAuthError(
      "Google sign-in could not be verified. Please try again.",
      "GOOGLE_SUB_MISSING"
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) {
    throw new GoogleAuthError(
      "Your Google account has no email address. Use a different sign-in method.",
      "GOOGLE_EMAIL_MISSING"
    );
  }

  const given =
    typeof payload.given_name === "string" ? payload.given_name.trim() : null;
  const family =
    typeof payload.family_name === "string" ? payload.family_name.trim() : null;
  const picture =
    typeof payload.picture === "string" ? payload.picture.trim() : null;
  const aud = typeof payload.aud === "string" ? payload.aud : String(payload.aud ?? "");
  const iss = typeof payload.iss === "string" ? payload.iss : "";

  return {
    sub,
    email,
    emailVerified: claimIsTrue(payload.email_verified),
    firstName: given || null,
    lastName: family || null,
    avatarUrl: picture || null,
    iss,
    aud,
  };
}
