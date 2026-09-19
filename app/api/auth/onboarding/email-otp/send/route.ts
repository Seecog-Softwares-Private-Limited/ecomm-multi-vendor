/**
 * Authenticated Customer onboarding email OTP send (phone-first flow).
 * Reuses CustomerEmailOtp table + SMTP.
 */

import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiConflict,
  apiError,
  apiValidationError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { formatValidationDetails, getSession } from "@/lib/auth";
import { z } from "zod";
import {
  checkEmailOtpSendRateLimit,
  generateOtpCode,
  invalidatePendingEmailOtps,
  normalizeEmailForOtp,
  OTP_EXPIRY_MS,
  storeEmailOtpHash,
} from "@/lib/auth/email-otp.service";
import { isDevConsoleOtpAllowed } from "@/lib/auth/otp.service";
import { emailConfig, sendCustomerEmailOtpEmail } from "@/lib/email";
import { isPlaceholderCustomerEmail } from "@/lib/auth/phone";

const sendSchema = z.object({
  email: z.string().email("Invalid email").max(255).toLowerCase().trim().optional(),
  resend: z.boolean().optional(),
});

/** POST /api/auth/onboarding/email-otp/send */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") {
    return apiForbidden("Only customer accounts can use this endpoint.");
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = sendSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(
      "Validation failed",
      formatValidationDetails(parsed.error.issues)
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: session.sub, deletedAt: null },
    select: { id: true, email: true, emailVerified: true, phoneVerified: true },
  });
  if (!user) return apiUnauthorized("Not authenticated");
  if (!user.phoneVerified) {
    return apiBadRequest("Verify your phone with OTP before verifying email.");
  }
  if (user.emailVerified && !isPlaceholderCustomerEmail(user.email)) {
    return apiSuccess({
      message: "Email is already verified.",
      emailVerified: true,
      expiresInSeconds: 0,
      emailSent: false,
    });
  }

  const emailNorm = normalizeEmailForOtp(parsed.data.email || user.email);
  if (!emailNorm || isPlaceholderCustomerEmail(emailNorm)) {
    return apiBadRequest("Save a real email on your profile before requesting an OTP.");
  }

  if (emailNorm !== user.email.toLowerCase()) {
    const owner = await prisma.user.findFirst({
      where: { email: emailNorm, deletedAt: null, id: { not: user.id } },
      select: { id: true },
    });
    if (owner) {
      return apiConflict(
        "This email is already registered with another account. Please log in to that account instead."
      );
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: emailNorm,
        emailVerified: false,
        authOnboardingComplete: false,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
  }

  if (!emailConfig.enabled && !isDevConsoleOtpAllowed() && process.env.NODE_ENV === "production") {
    return apiError("Email OTP is not configured on this server.", Status.SERVICE_UNAVAILABLE);
  }

  const rate = await checkEmailOtpSendRateLimit(emailNorm);
  if (!rate.allowed) {
    if (rate.reason === "cooldown") {
      return apiError(
        "Please wait before requesting another code.",
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
    console.info(
      `[onboarding-email-otp][DEV] OTP for user ${user.id.slice(0, 8)}…: ${plainOtp}`
    );
  } else if (!emailResult.sent && process.env.NODE_ENV === "production") {
    return apiError(
      emailResult.error ?? "Could not send verification email.",
      Status.SERVICE_UNAVAILABLE
    );
  }

  return apiSuccess({
    message: emailResult.sent
      ? "OTP sent to your email."
      : "OTP generated. Check server console when OTP_DEV_CONSOLE=true.",
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    emailSent: emailResult.sent,
    email: emailNorm,
  });
});
