/**
 * Targeted smoke test for HMAC-signed OAuth state (vendor WebView + CCT fix).
 * Run: npx tsx scripts/test-oauth-state.ts
 */
import { NextRequest } from "next/server";
import {
  encodeOAuthState,
  decodeOAuthState,
  generateOAuthState,
  validateOAuthCallbackState,
  OAUTH_STATE_COOKIE,
} from "../src/lib/auth/oauth";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-oauth-state-secret-32-chars-min";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const base = generateOAuthState("/vendor?app=1", "vendor");
const signed = encodeOAuthState(base);

assert(signed.includes("."), "signed state must contain HMAC delimiter");
assert(decodeOAuthState(signed)?.flow === "vendor", "decode signed vendor flow");
assert(decodeOAuthState(signed)?.returnUrl === "/vendor?app=1", "decode returnUrl");

// Signed state validates without cookie (WebView/CCT split).
const reqNoCookie = new NextRequest(
  `https://indovyapar.com/api/auth/oauth/google/callback?state=${encodeURIComponent(signed)}`
);
const noCookie = validateOAuthCallbackState(reqNoCookie, signed);
assert(noCookie.ok, "signed state must validate without oauth_state cookie");

// Cookie mismatch with signed state must fail.
const reqMismatch = new NextRequest(
  `https://indovyapar.com/api/auth/oauth/google/callback?state=${encodeURIComponent(signed)}`,
  { headers: { cookie: `${OAUTH_STATE_COOKIE}=tampered` } }
);
const mismatch = validateOAuthCallbackState(reqMismatch, signed);
assert(!mismatch.ok && mismatch.reason === "mismatch", "cookie mismatch must reject");

// Legacy unsigned requires cookie.
const legacy = Buffer.from(
  JSON.stringify({ state: "abc", returnUrl: "/", flow: "customer" })
).toString("base64url");
const legacyNoCookie = validateOAuthCallbackState(
  new NextRequest("https://indovyapar.com/callback"),
  legacy
);
assert(!legacyNoCookie.ok && legacyNoCookie.reason === "missing", "legacy needs cookie");

const legacyWithCookie = validateOAuthCallbackState(
  new NextRequest("https://indovyapar.com/callback", {
    headers: { cookie: `${OAUTH_STATE_COOKIE}=${legacy}` },
  }),
  legacy
);
assert(legacyWithCookie.ok, "legacy validates with matching cookie");

// Tampered signature rejected.
const tampered = signed.slice(0, -2) + "xx";
assert(decodeOAuthState(tampered) === null, "tampered signature rejected");

console.log("OK: OAuth state signing and validation tests passed");
