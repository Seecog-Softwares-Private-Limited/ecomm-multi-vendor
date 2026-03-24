import { createHmac, timingSafeEqual } from "crypto";
import { authConfig } from "./config";

function secret(): string {
  return process.env.OTP_HMAC_SECRET || authConfig.jwtSecret || "dev-otp-hmac-change-me";
}

export function hashPhoneOtp(phoneNorm: string, code: string): string {
  return createHmac("sha256", secret())
    .update(phoneNorm)
    .update("\0")
    .update(code)
    .digest("hex");
}

export function verifyPhoneOtp(phoneNorm: string, code: string, storedHash: string): boolean {
  const computed = hashPhoneOtp(phoneNorm, code);
  if (computed.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(computed, "utf8"), Buffer.from(storedHash, "utf8"));
  } catch {
    return false;
  }
}
