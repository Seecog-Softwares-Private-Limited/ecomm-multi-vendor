/**
 * Customer registration email OTP (send / verify).
 * Does not create a User; issues a short-lived registration proof on success.
 */

import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiConflict,
  apiUnauthorized,
  apiError,
  apiValidationError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { formatValidationDetails } from "@/lib/auth";
import { z } from "zod";
import {
  checkEmailOtpSendRateLimit,
  findActiveEmailOtpRow,
  generateOtpCode,
  incrementEmailOtpAttempt,
  invalidatePendingEmailOtps,
  isSixDigitOtp,
  markEmailOtpConsumed,
  normalizeEmailForOtp,
  OTP_EXPIRY_MS,
  storeEmailOtpHash,
  verifyStoredEmailOtp,
} from "@/lib/auth/email-otp.service";
import { isDevConsoleOtpAllowed } from "@/lib/auth/otp.service";
import { signEmailRegistrationProof } from "@/lib/auth/registration-proof";
import { emailConfig, sendCustomerEmailOtpEmail } from "@/lib/email";
import { isPlaceholderCustomerEmail } from "@/lib/auth/phone";

const sendSchema = z.object({
  email: z.string().email("Invalid email").max(255).toLowerCase().trim(),
  resend: z.boolean().optional(),
});

const verifySchema = z
  .object({
    email: z.string().email("Invalid email").max(255).toLowerCase().trim(),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP").optional(),
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP").optional(),
  })
  .refine((d) => Boolean(d.otp?.trim() || d.code?.trim()), {
    message: "OTP is required",
    path: ["otp"],
  })
  .transform((d) => ({
    email: d.email,
    code: (d.otp ?? d.code ?? "").trim(),
  }));

function canSendEmail(): boolean {
  return emailConfig.enabled || isDevConsoleOtpAllowed() || process.env.NODE_ENV === "development";
}

/** POST /api/auth/register/email-otp/send */
export const POST_REGISTER_EMAIL_OTP_SEND = withApiHandler(
  async (request: NextRequest) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiBadRequest("Invalid JSON body");
    }

    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(
        "Validation failed",
        formatValidationDetails(parsed.error.issues)
      );
    }

    const emailNorm = normalizeEmailForOtp(parsed.data.email);
    if (isPlaceholderCustomerEmail(emailNorm)) {
      return apiBadRequest("Enter a valid personal email address.");
    }

    const existing = await prisma.user.findFirst({
      where: { email: emailNorm, deletedAt: null },
      select: { id: true, emailVerified: true, passwordHash: true },
    });
    if (existing?.emailVerified) {
      return apiConflict("An account with this email already exists. Please sign in.");
    }
    // Phone-first / Google draft occupying this email without password: block register path.
    if (existing && !existing.emailVerified && existing.passwordHash == null) {
      return apiConflict(
        "This email is already associated with another sign-in method. Please sign in with that method."
      );
    }

    if (!canSendEmail() && process.env.NODE_ENV === "production") {
      return apiError(
        "Email OTP is not configured on this server.",
        Status.SERVICE_UNAVAILABLE
      );
    }

    const rate = await checkEmailOtpSendRateLimit(emailNorm);
    if (!rate.allowed) {
      if (rate.reason === "cooldown") {
        return apiError(
          parsed.data.resend
            ? "Please wait before requesting another code."
            : "Please wait a minute before requesting another code.",
          Status.TOO_MANY_REQUESTS
        );
      }
      return apiError(
        "Too many OTP requests for this email. Try again later.",
        Status.TOO_MANY_REQUESTS
      );
    }

    const plainOtp = generateOtpCode();
    await invalidatePendingEmailOtps(emailNorm);
    await storeEmailOtpHash(emailNorm, plainOtp);

    const emailResult = await sendCustomerEmailOtpEmail(emailNorm, plainOtp);

    if (!emailResult.sent && isDevConsoleOtpAllowed()) {
      const hint = emailNorm.includes("@")
        ? `${emailNorm.split("@")[0]?.slice(0, 2) ?? ""}***@${emailNorm.split("@")[1] ?? ""}`
        : "***";
      console.info(
        `[email-otp][DEV] OTP for ${hint}: ${plainOtp} (expires in ${OTP_EXPIRY_MS / 1000}s)`
      );
    } else if (!emailResult.sent && process.env.NODE_ENV === "production") {
      return apiError(
        emailResult.error ?? "Could not send verification email. Try again.",
        Status.SERVICE_UNAVAILABLE
      );
    }

    return apiSuccess({
      message: emailResult.sent
        ? "OTP sent to your email."
        : "OTP generated. Configure SMTP to receive email (or check server console when OTP_DEV_CONSOLE=true).",
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      emailSent: emailResult.sent,
    });
  }
);

/** POST /api/auth/register/email-otp/verify */
export const POST_REGISTER_EMAIL_OTP_VERIFY = withApiHandler(
  async (request: NextRequest) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiBadRequest("Invalid JSON body");
    }

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(
        "Validation failed",
        formatValidationDetails(parsed.error.issues)
      );
    }

    const emailNorm = normalizeEmailForOtp(parsed.data.email);
    if (!isSixDigitOtp(parsed.data.code)) {
      return apiBadRequest("Enter the 6-digit OTP from your email.");
    }

    const row = await findActiveEmailOtpRow(emailNorm);
    if (!row) {
      return apiUnauthorized("Code expired or invalid. Request a new OTP.");
    }

    const result = verifyStoredEmailOtp(row, parsed.data.code);
    if (!result.valid) {
      if (result.reason === "wrong_code") {
        await incrementEmailOtpAttempt(row.id);
      }
      if (result.reason === "max_attempts") {
        return apiUnauthorized("Too many wrong attempts. Request a new OTP.");
      }
      if (result.reason === "expired") {
        return apiUnauthorized("Code expired. Request a new OTP.");
      }
      return apiUnauthorized("Code expired or invalid. Request a new OTP.");
    }

    await markEmailOtpConsumed(result.rowId);
    const emailProofToken = await signEmailRegistrationProof(emailNorm, result.rowId);

    return apiSuccess({
      emailVerified: true,
      email: emailNorm,
      emailProofToken,
      message: "Email verified.",
    });
  }
);
