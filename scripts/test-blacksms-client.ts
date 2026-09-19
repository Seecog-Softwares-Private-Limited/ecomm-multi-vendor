/**
 * Unit checks for BlackSMS response parsing (no network).
 * Run: npx tsx scripts/test-blacksms-client.ts
 */
import assert from "node:assert/strict";
import {
  isBlackSmsOtpSuccess,
  isBlackSmsBulkSuccess,
  maskIndianMobile,
} from "../src/sms/blacksms.client";

assert.equal(isBlackSmsOtpSuccess({ status: 1, message: "OTP Sent" }, 200), true);
assert.equal(isBlackSmsOtpSuccess({ status: 0, message: "Invalid API Key" }, 200), false);
assert.equal(isBlackSmsOtpSuccess({ status: 1 }, 500), false);
assert.equal(isBlackSmsBulkSuccess({ success: true, message: "ok" }, 200), true);
assert.equal(isBlackSmsBulkSuccess({ success: false, message: "fail" }, 200), false);
assert.equal(maskIndianMobile("9876543210"), "98******10");
assert.equal(maskIndianMobile("9599690062"), "95******62");

console.log("blacksms-client: ok");
