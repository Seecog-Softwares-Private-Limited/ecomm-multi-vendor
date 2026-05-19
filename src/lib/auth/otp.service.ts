/**
 * Customer phone OTP: generation, secure storage, expiry, and verification.
 *
 * OTPs are 6 digits, stored as HMAC-SHA256 hashes (never plain text in DB).
 * Default lifetime: 5 minutes. Resend cooldown and hourly caps reduce spam.
 */

import { randomInt, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone-otp-hash";
import { PHONE_OTP_MSG91_MARKER } from "@/lib/sms/msg91-otp";

/** OTP validity window (5 minutes). */
export const OTP_EXPIRY_MS = 5 * 60_000;

/** Minimum delay between send-otp requests for the same number. */
export const OTP_RESEND_COOLDOWN_MS = 60_000;

/** Max wrong verify attempts per issued OTP row. */
export const OTP_MAX_VERIFY_ATTEMPTS = 5;

/** Max OTP SMS requests per phone per hour (spam protection). */
export const OTP_MAX_SENDS_PER_HOUR = 8;

export const OTP_LENGTH = 6;

export type OtpProvider = "fast2sms" | "msg91" | "dev_console";

/**
 * Cryptographically secure 6-digit OTP (100000–999999).
 */
export function generateOtpCode(): string {
  const n = randomInt(100_000, 1_000_000);
  return String(n);
}

export function isSixDigitOtp(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/**
 * Invalidate any unconsumed OTP rows for this phone before issuing a new one.
 */
export async function invalidatePendingOtps(phoneNorm: string): Promise<void> {
  await prisma.customerPhoneOtp.updateMany({
    where: { phoneNorm, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "cooldown" | "hourly_limit"; retryAfterSeconds?: number };

/**
 * Enforces resend cooldown (1 min) and hourly send cap per phone.
 */
export async function checkOtpSendRateLimit(phoneNorm: string): Promise<RateLimitResult> {
  const now = Date.now();

  const recent = await prisma.customerPhoneOtp.findFirst({
    where: {
      phoneNorm,
      createdAt: { gte: new Date(now - OTP_RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent) {
    const retryAfterSeconds = Math.ceil(
      (recent.createdAt.getTime() + OTP_RESEND_COOLDOWN_MS - now) / 1000
    );
    return {
      allowed: false,
      reason: "cooldown",
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  const hourAgo = new Date(now - 60 * 60_000);
  const sendsLastHour = await prisma.customerPhoneOtp.count({
    where: { phoneNorm, createdAt: { gte: hourAgo } },
  });

  if (sendsLastHour >= OTP_MAX_SENDS_PER_HOUR) {
    return { allowed: false, reason: "hourly_limit" };
  }

  return { allowed: true };
}

export type StoredOtpRow = {
  id: string;
  phoneNorm: string;
  codeHash: string;
  expiresAt: Date;
  attemptCount: number;
};

/**
 * Persists hashed OTP with expiry. Caller must send SMS separately (Fast2SMS).
 */
export async function storeOtpHash(phoneNorm: string, plainOtp: string): Promise<StoredOtpRow> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const codeHash = hashPhoneOtp(phoneNorm, plainOtp);

  const row = await prisma.customerPhoneOtp.create({
    data: {
      id: randomUUID(),
      phoneNorm,
      codeHash,
      expiresAt,
      attemptCount: 0,
    },
    select: {
      id: true,
      phoneNorm: true,
      codeHash: true,
      expiresAt: true,
      attemptCount: true,
    },
  });

  return row;
}

/**
 * Loads the latest active OTP row (not consumed, not expired).
 */
export async function findActiveOtpRow(phoneNorm: string): Promise<StoredOtpRow | null> {
  return prisma.customerPhoneOtp.findFirst({
    where: {
      phoneNorm,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      phoneNorm: true,
      codeHash: true,
      expiresAt: true,
      attemptCount: true,
    },
  });
}

export function isMsg91BackedRow(codeHash: string): boolean {
  return codeHash === PHONE_OTP_MSG91_MARKER;
}

export type VerifyStoredOtpResult =
  | { valid: true; rowId: string }
  | { valid: false; reason: "not_found" | "expired" | "max_attempts" | "wrong_code" | "wrong_provider" };

/**
 * Verifies user-entered OTP against locally stored HMAC (Fast2SMS / dev-console flow).
 */
export function verifyStoredOtp(
  row: StoredOtpRow,
  code: string
): VerifyStoredOtpResult {
  if (isMsg91BackedRow(row.codeHash)) {
    return { valid: false, reason: "wrong_provider" };
  }

  if (row.attemptCount >= OTP_MAX_VERIFY_ATTEMPTS) {
    return { valid: false, reason: "max_attempts" };
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    return { valid: false, reason: "expired" };
  }

  if (!verifyPhoneOtp(row.phoneNorm, code.trim(), row.codeHash)) {
    return { valid: false, reason: "wrong_code" };
  }

  return { valid: true, rowId: row.id };
}

export async function markOtpConsumed(rowId: string): Promise<void> {
  await prisma.customerPhoneOtp.update({
    where: { id: rowId },
    data: { consumedAt: new Date() },
  });
}

export async function incrementOtpAttempt(rowId: string): Promise<void> {
  await prisma.customerPhoneOtp.update({
    where: { id: rowId },
    data: { attemptCount: { increment: 1 } },
  });
}

/** Dev-only: log OTP to server console instead of SMS (never enable in production). */
export function isDevConsoleOtpAllowed(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.OTP_DEV_CONSOLE === "true"
  );
}

export function resolveOtpProvider(): OtpProvider | null {
  const fast2 = Boolean(
    process.env.FAST2SMS_API_KEY?.trim() && process.env.FAST2SMS_OTP_ID?.trim()
  );
  if (fast2) return "fast2sms";
  if (process.env.MSG91_AUTH_KEY?.trim()) return "msg91";
  if (isDevConsoleOtpAllowed()) return "dev_console";
  return null;
}
