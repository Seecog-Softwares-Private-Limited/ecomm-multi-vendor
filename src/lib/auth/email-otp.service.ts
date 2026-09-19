/**
 * Customer email OTP: generation, HMAC storage, expiry, verify attempts.
 * Mirrors phone OTP security model; never stores plaintext codes.
 */

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashEmailOtp, verifyEmailOtpHash } from "@/lib/auth/email-otp-hash";
import {
  generateOtpCode,
  isSixDigitOtp,
  OTP_EXPIRY_MS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  type RateLimitResult,
} from "@/lib/auth/otp.service";

export {
  generateOtpCode,
  isSixDigitOtp,
  OTP_EXPIRY_MS,
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
};

export function normalizeEmailForOtp(email: string): string {
  return email.trim().toLowerCase();
}

export async function invalidatePendingEmailOtps(emailNorm: string): Promise<void> {
  await prisma.customerEmailOtp.updateMany({
    where: { emailNorm, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}

export async function checkEmailOtpSendRateLimit(
  emailNorm: string
): Promise<RateLimitResult> {
  const now = Date.now();

  const recent = await prisma.customerEmailOtp.findFirst({
    where: {
      emailNorm,
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
  const sendsLastHour = await prisma.customerEmailOtp.count({
    where: { emailNorm, createdAt: { gte: hourAgo } },
  });

  if (sendsLastHour >= OTP_MAX_SENDS_PER_HOUR) {
    return { allowed: false, reason: "hourly_limit" };
  }

  return { allowed: true };
}

export type StoredEmailOtpRow = {
  id: string;
  emailNorm: string;
  codeHash: string;
  expiresAt: Date;
  attemptCount: number;
};

export async function storeEmailOtpHash(
  emailNorm: string,
  plainOtp: string
): Promise<StoredEmailOtpRow> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const codeHash = hashEmailOtp(emailNorm, plainOtp);

  return prisma.customerEmailOtp.create({
    data: {
      id: randomUUID(),
      emailNorm,
      codeHash,
      expiresAt,
      attemptCount: 0,
    },
    select: {
      id: true,
      emailNorm: true,
      codeHash: true,
      expiresAt: true,
      attemptCount: true,
    },
  });
}

export async function findActiveEmailOtpRow(
  emailNorm: string
): Promise<StoredEmailOtpRow | null> {
  return prisma.customerEmailOtp.findFirst({
    where: {
      emailNorm,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      emailNorm: true,
      codeHash: true,
      expiresAt: true,
      attemptCount: true,
    },
  });
}

export type VerifyStoredEmailOtpResult =
  | { valid: true; rowId: string }
  | { valid: false; reason: "not_found" | "expired" | "max_attempts" | "wrong_code" };

export function verifyStoredEmailOtp(
  row: StoredEmailOtpRow,
  code: string
): VerifyStoredEmailOtpResult {
  if (row.attemptCount >= OTP_MAX_VERIFY_ATTEMPTS) {
    return { valid: false, reason: "max_attempts" };
  }
  if (row.expiresAt.getTime() <= Date.now()) {
    return { valid: false, reason: "expired" };
  }
  if (!verifyEmailOtpHash(row.emailNorm, code.trim(), row.codeHash)) {
    return { valid: false, reason: "wrong_code" };
  }
  return { valid: true, rowId: row.id };
}

export async function markEmailOtpConsumed(rowId: string): Promise<void> {
  await prisma.customerEmailOtp.update({
    where: { id: rowId },
    data: { consumedAt: new Date() },
  });
}

export async function incrementEmailOtpAttempt(rowId: string): Promise<void> {
  await prisma.customerEmailOtp.update({
    where: { id: rowId },
    data: { attemptCount: { increment: 1 } },
  });
}
