/**
 * Local tests for Vendor Sign in with Apple identity-token verification.
 * Does not call Apple or the database. Run: npx tsx scripts/test-vendor-apple-auth.ts
 */

import assert from "node:assert/strict";
import * as jose from "jose";
import {
  AppleAuthError,
  APPLE_ISSUER,
  VENDOR_IOS_BUNDLE_ID,
  isApplePrivateRelayEmail,
  resolveAppleVendorMatch,
  sha256Hex,
  verifyAppleIdentityToken,
} from "../src/lib/auth/apple";

const RAW_NONCE = "a".repeat(64);
const HASHED_NONCE = sha256Hex(RAW_NONCE);

async function makeSigner() {
  const { publicKey, privateKey } = await jose.generateKeyPair("RS256");
  return { publicKey, privateKey };
}

async function signToken(
  privateKey: jose.KeyLike,
  claims: Record<string, unknown>,
  audience = VENDOR_IOS_BUNDLE_ID
) {
  return new jose.SignJWT({
    nonce: HASHED_NONCE,
    email: "vendor@example.com",
    email_verified: true,
    ...claims,
  })
    .setProtectedHeader({ alg: "RS256", kid: "test-kid" })
    .setIssuer(APPLE_ISSUER)
    .setAudience(audience)
    .setSubject(typeof claims.sub === "string" ? claims.sub : "apple-sub-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

async function expectReject(fn: () => Promise<unknown>, code?: string) {
  try {
    await fn();
    assert.fail("expected AppleAuthError");
  } catch (err) {
    assert.ok(err instanceof AppleAuthError, `expected AppleAuthError, got ${err}`);
    if (code) assert.equal(err.code, code);
  }
}

async function main() {
  const { publicKey, privateKey } = await makeSigner();

  assert.equal(isApplePrivateRelayEmail("abc@privaterelay.appleid.com"), true);
  assert.equal(isApplePrivateRelayEmail("vendor@example.com"), false);
  assert.equal(isApplePrivateRelayEmail(""), false);

  const valid = await signToken(privateKey, { sub: "apple-sub-1" });
  const claims = await verifyAppleIdentityToken(valid, RAW_NONCE, { key: publicKey });
  assert.equal(claims.sub, "apple-sub-1");
  assert.equal(claims.email, "vendor@example.com");
  assert.equal(claims.emailVerified, true);
  assert.equal(claims.isPrivateRelay, false);
  assert.equal(claims.iss, APPLE_ISSUER);
  assert.equal(claims.aud, VENDOR_IOS_BUNDLE_ID);

  const relayToken = await signToken(privateKey, {
    sub: "apple-sub-relay",
    email: "hidden@privaterelay.appleid.com",
    is_private_email: true,
    email_verified: true,
  });
  const relayClaims = await verifyAppleIdentityToken(relayToken, RAW_NONCE, { key: publicKey });
  assert.equal(relayClaims.isPrivateRelay, true);
  assert.equal(relayClaims.email, "hidden@privaterelay.appleid.com");

  const noEmailToken = await signToken(privateKey, {
    sub: "apple-sub-no-email",
    email: undefined,
    email_verified: false,
  });
  const noEmailClaims = await verifyAppleIdentityToken(noEmailToken, RAW_NONCE, { key: publicKey });
  assert.equal(noEmailClaims.email, undefined);

  await expectReject(
    () => verifyAppleIdentityToken("not-a-jwt", RAW_NONCE, { key: publicKey }),
    "APPLE_TOKEN_INVALID"
  );

  await expectReject(
    () => verifyAppleIdentityToken("", RAW_NONCE, { key: publicKey }),
    "APPLE_TOKEN_MISSING"
  );

  await expectReject(
    () => verifyAppleIdentityToken(valid, "", { key: publicKey }),
    "APPLE_NONCE_MISSING"
  );

  await expectReject(
    () => verifyAppleIdentityToken(valid, "wrong-nonce", { key: publicKey }),
    "APPLE_NONCE_MISMATCH"
  );

  const wrongAud = await signToken(privateKey, { sub: "apple-sub-1" }, "com.other.app");
  await expectReject(
    () => verifyAppleIdentityToken(wrongAud, RAW_NONCE, { key: publicKey }),
    "APPLE_TOKEN_CLAIMS"
  );

  const wrongIss = await new jose.SignJWT({
    nonce: HASHED_NONCE,
    email: "vendor@example.com",
    email_verified: true,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer("https://example.invalid")
    .setAudience(VENDOR_IOS_BUNDLE_ID)
    .setSubject("apple-sub-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  await expectReject(
    () => verifyAppleIdentityToken(wrongIss, RAW_NONCE, { key: publicKey }),
    "APPLE_TOKEN_CLAIMS"
  );

  const expired = await new jose.SignJWT({
    nonce: HASHED_NONCE,
    email: "vendor@example.com",
    email_verified: true,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(APPLE_ISSUER)
    .setAudience(VENDOR_IOS_BUNDLE_ID)
    .setSubject("apple-sub-1")
    .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
    .sign(privateKey);
  await expectReject(
    () => verifyAppleIdentityToken(expired, RAW_NONCE, { key: publicKey }),
    "APPLE_TOKEN_EXPIRED"
  );

  const { privateKey: otherKey } = await makeSigner();
  const badSig = await signToken(otherKey, { sub: "apple-sub-1" });
  await expectReject(
    () => verifyAppleIdentityToken(badSig, RAW_NONCE, { key: publicKey }),
    "APPLE_TOKEN_INVALID"
  );

  const noNonce = await new jose.SignJWT({
    email: "vendor@example.com",
    email_verified: true,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(APPLE_ISSUER)
    .setAudience(VENDOR_IOS_BUNDLE_ID)
    .setSubject("apple-sub-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  await expectReject(
    () => verifyAppleIdentityToken(noNonce, RAW_NONCE, { key: publicKey }),
    "APPLE_NONCE_MISSING"
  );

  const existingApple = {
    id: "seller-apple",
    email: "vendor@example.com",
    appleUserId: "apple-sub-1",
  };
  const existingGoogle = {
    id: "seller-google",
    email: "vendor@example.com",
    appleUserId: null,
  };
  const existingPassword = {
    id: "seller-password",
    email: "vendor@example.com",
    appleUserId: null,
  };

  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "apple-sub-1",
      verifiedRealEmail: "vendor@example.com",
      byAppleSub: existingApple,
      byEmail: existingApple,
    }),
    { action: "login", sellerId: "seller-apple", linkApple: false }
  );

  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "apple-sub-1",
      verifiedRealEmail: "vendor@example.com",
      byAppleSub: null,
      byEmail: existingPassword,
    }),
    { action: "login", sellerId: "seller-password", linkApple: true }
  );

  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "apple-sub-1",
      verifiedRealEmail: "vendor@example.com",
      byAppleSub: null,
      byEmail: existingGoogle,
    }),
    { action: "login", sellerId: "seller-google", linkApple: true }
  );

  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "apple-sub-1",
      verifiedRealEmail: null,
      byAppleSub: null,
      byEmail: {
        id: "seller-relay-lookalike",
        email: "hidden@privaterelay.appleid.com",
        appleUserId: null,
      },
    }),
    { action: "register" }
  );

  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "apple-sub-unknown",
      verifiedRealEmail: null,
      byAppleSub: null,
      byEmail: null,
    }),
    { action: "register" }
  );

  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "apple-sub-2",
      verifiedRealEmail: "vendor@example.com",
      byAppleSub: null,
      byEmail: existingApple,
    }),
    { action: "conflict" }
  );

  console.log("vendor Apple auth tests passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
