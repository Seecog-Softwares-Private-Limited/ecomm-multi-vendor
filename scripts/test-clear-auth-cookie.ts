/**
 * Focused check: clearAuthCookie must emit two deletion Set-Cookie headers
 * when a shared auth domain is configured (domain + host-only).
 *
 * Run: npx tsx scripts/test-clear-auth-cookie.ts
 *
 * Env must be set before importing cookies.ts (domain / secure are read at load).
 */
process.env.NEXT_PUBLIC_APP_URL = "https://www.indovyapar.com";
process.env.APP_URL = "https://www.indovyapar.com";
process.env.COOKIE_SECURE = "true";

const { NextResponse } = await import("next/server");
const { clearAuthCookie } = await import("../src/lib/auth/cookies");

function fail(msg: string): never {
  console.error("FAIL:", msg);
  process.exit(1);
}

const res = NextResponse.json({ ok: true });
clearAuthCookie(res);

const setCookies =
  typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];

const authClears = setCookies.filter((c) =>
  c.toLowerCase().startsWith("auth_token=")
);

if (authClears.length < 2) {
  fail(
    `expected >=2 auth_token Set-Cookie deletions, got ${authClears.length}: ${JSON.stringify(authClears)}`
  );
}

const withDomain = authClears.find((c) =>
  /;\s*Domain=\.indovyapar\.com/i.test(c)
);
const hostOnly = authClears.find((c) => !/;\s*Domain=/i.test(c));

if (!withDomain) {
  fail(`missing Domain=.indovyapar.com deletion: ${JSON.stringify(authClears)}`);
}
if (!hostOnly) {
  fail(`missing host-only (no Domain) deletion: ${JSON.stringify(authClears)}`);
}

for (const c of [withDomain, hostOnly]) {
  if (!/;\s*Path=\//i.test(c)) fail(`missing Path=/: ${c}`);
  if (!/;\s*Max-Age=0/i.test(c)) fail(`missing Max-Age=0: ${c}`);
  if (!/;\s*HttpOnly/i.test(c)) fail(`missing HttpOnly: ${c}`);
  if (!/;\s*SameSite=Lax/i.test(c)) fail(`missing SameSite=Lax: ${c}`);
  if (!/;\s*Secure/i.test(c)) fail(`missing Secure: ${c}`);
  if (!/^auth_token=;/i.test(c)) fail(`deletion must empty value: ${c}`);
}

const unrelated = setCookies.filter(
  (c) => !c.toLowerCase().startsWith("auth_token=")
);
if (unrelated.length > 0) {
  fail(`unexpected unrelated Set-Cookie: ${JSON.stringify(unrelated)}`);
}

console.log("PASS: clearAuthCookie emits domain + host-only deletions");
for (const c of authClears) console.log(" ", c);
