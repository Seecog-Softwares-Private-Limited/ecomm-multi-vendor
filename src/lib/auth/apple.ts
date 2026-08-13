/**
 * Sign in with Apple — identity token verification for the Vendor iOS app.
 *
 * Native flow only: the Expo app sends Apple's identityToken + a raw nonce.
 * No Apple .p8 / client_secret is required to verify the identity token.
 */

import { createHash } from "crypto";
import * as jose from "jose";

export const APPLE_ISSUER = "https://appleid.apple.com";
export const APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys";

/** iOS bundle ID for IndoVyapar Vendor (identity token `aud`). */
export const VENDOR_IOS_BUNDLE_ID =
  process.env.APPLE_CLIENT_ID?.trim() ||
  process.env.VENDOR_IOS_BUNDLE_ID?.trim() ||
  "com.blablabla0978.vendorapp";

export const APPLE_PRIVATE_RELAY_DOMAIN = "privaterelay.appleid.com";

export class AppleAuthError extends Error {
  readonly code: string;

  constructor(message: string, code = "APPLE_AUTH_FAILED") {
    super(message);
    this.name = "AppleAuthError";
    this.code = code;
  }
}

export interface AppleIdentityClaims {
  sub: string;
  email?: string;
  emailVerified: boolean;
  isPrivateRelay: boolean;
  nonce?: string;
  iss: string;
  aud: string;
  exp: number;
  iat?: number;
}

export type AppleJwtVerifyKey = jose.JWTVerifyGetKey | jose.CryptoKey | Uint8Array;

let remoteJwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

function getAppleJwks(): ReturnType<typeof jose.createRemoteJWKSet> {
  if (!remoteJwks) {
    remoteJwks = jose.createRemoteJWKSet(new URL(APPLE_JWKS_URL));
  }
  return remoteJwks;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function isApplePrivateRelayEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const host = email.trim().toLowerCase().split("@")[1] ?? "";
  return host === APPLE_PRIVATE_RELAY_DOMAIN;
}

function claimIsTrue(value: unknown): boolean {
  return value === true || value === "true";
}

/**
 * Cryptographically verify Apple's identity token and the request nonce.
 * `key` is injectable for unit tests; production uses Apple's JWKS.
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  rawNonce: string,
  options: {
    audience?: string;
    key?: AppleJwtVerifyKey;
    now?: Date;
  } = {}
): Promise<AppleIdentityClaims> {
  const token = identityToken?.trim();
  const nonce = rawNonce?.trim();
  if (!token) {
    throw new AppleAuthError("Missing Apple identity token", "APPLE_TOKEN_MISSING");
  }
  if (!nonce) {
    throw new AppleAuthError("Missing Apple nonce", "APPLE_NONCE_MISSING");
  }

  const audience = options.audience?.trim() || VENDOR_IOS_BUNDLE_ID;
  const key = options.key ?? getAppleJwks();

  let payload: jose.JWTPayload;
  try {
    const verified = await jose.jwtVerify(token, key, {
      issuer: APPLE_ISSUER,
      audience,
      clockTolerance: 5,
      currentDate: options.now,
    });
    payload = verified.payload;
  } catch (err) {
    const code =
      err instanceof jose.errors.JWTExpired
        ? "APPLE_TOKEN_EXPIRED"
        : err instanceof jose.errors.JWTClaimValidationFailed
          ? "APPLE_TOKEN_CLAIMS"
          : "APPLE_TOKEN_INVALID";
    throw new AppleAuthError("Apple sign-in could not be verified. Please try again.", code);
  }

  const sub = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!sub) {
    throw new AppleAuthError("Apple sign-in could not be verified. Please try again.", "APPLE_SUB_MISSING");
  }

  const tokenNonce = typeof payload.nonce === "string" ? payload.nonce.trim() : "";
  if (!tokenNonce) {
    throw new AppleAuthError("Apple sign-in could not be verified. Please try again.", "APPLE_NONCE_MISSING");
  }

  const expectedNonce = sha256Hex(nonce);
  if (tokenNonce !== expectedNonce) {
    throw new AppleAuthError("Apple sign-in could not be verified. Please try again.", "APPLE_NONCE_MISMATCH");
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : undefined;
  const isPrivateRelay =
    claimIsTrue(payload.is_private_email) || isApplePrivateRelayEmail(email);

  return {
    sub,
    email: email || undefined,
    emailVerified: claimIsTrue(payload.email_verified),
    isPrivateRelay,
    nonce: tokenNonce,
    iss: String(payload.iss ?? ""),
    aud: Array.isArray(payload.aud) ? String(payload.aud[0] ?? "") : String(payload.aud ?? ""),
    exp: typeof payload.exp === "number" ? payload.exp : 0,
    iat: typeof payload.iat === "number" ? payload.iat : undefined,
  };
}

export type SellerAppleLookup = {
  id: string;
  email: string;
  appleUserId: string | null;
};

export type AppleVendorMatch =
  | { action: "login"; sellerId: string; linkApple: boolean }
  | { action: "conflict" }
  | { action: "register" };

/**
 * Decide how an Apple identity maps to an existing Vendor.
 * Never auto-creates a Seller. Never uses private-relay email as a merge key.
 */
export function resolveAppleVendorMatch(input: {
  appleUserId: string;
  verifiedRealEmail: string | null;
  byAppleSub: SellerAppleLookup | null;
  byEmail: SellerAppleLookup | null;
}): AppleVendorMatch {
  const { appleUserId, verifiedRealEmail, byAppleSub, byEmail } = input;

  if (byAppleSub) {
    return { action: "login", sellerId: byAppleSub.id, linkApple: false };
  }

  if (!verifiedRealEmail || !byEmail) {
    return { action: "register" };
  }

  if (byEmail.appleUserId && byEmail.appleUserId !== appleUserId) {
    return { action: "conflict" };
  }

  return { action: "login", sellerId: byEmail.id, linkApple: !byEmail.appleUserId };
}
