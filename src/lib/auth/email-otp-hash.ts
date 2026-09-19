import { createHmac, timingSafeEqual } from "crypto";
import { authConfig } from "./config";

function secret(): string {
  return process.env.OTP_HMAC_SECRET || authConfig.jwtSecret || "dev-otp-hmac-change-me";
}

export function hashEmailOtp(emailNorm: string, code: string): string {
  return createHmac("sha256", secret())
    .update(emailNorm)
    .update("\0")
    .update(code)
    .digest("hex");
}

export function verifyEmailOtpHash(
  emailNorm: string,
  code: string,
  storedHash: string
): boolean {
  const computed = hashEmailOtp(emailNorm, code);
  if (computed.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(computed, "utf8"), Buffer.from(storedHash, "utf8"));
  } catch {
    return false;
  }
}
