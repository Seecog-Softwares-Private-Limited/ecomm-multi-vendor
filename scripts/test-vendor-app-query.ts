/**
 * Unit checks for vendor hybrid-app query preservation helpers.
 * Run: npx tsx scripts/test-vendor-app-query.ts
 */
import {
  buildVendorLoginPath,
  copyVendorAppContextParams,
} from "../src/lib/vendor-app-query";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`OK: ${message}`);
  }
}

const source = new URLSearchParams("app=1&v=1.0.0.2&foo=bar");
const target = new URLSearchParams();
copyVendorAppContextParams(source, target);

assert(target.get("app") === "1", "copies app param");
assert(target.get("v") === "1.0.0.2", "copies v param");
assert(target.get("foo") == null, "does not copy unrelated params");

const loginPath = buildVendorLoginPath("/vendor/settings", source);
assert(
  loginPath === "/vendor/login?callbackUrl=%2Fvendor%2Fsettings&app=1&v=1.0.0.2",
  "builds login path with callback and app context"
);

const loginNoApp = buildVendorLoginPath("/vendor", null);
assert(
  loginNoApp === "/vendor/login?callbackUrl=%2Fvendor",
  "builds login path without app context when source is empty"
);

if (process.exitCode) {
  process.exit(process.exitCode);
}
console.log("\nAll vendor-app-query checks passed.");
