/**
 * POST /api/auth/onboarding/email-otp/verify
 * Authenticated phone-first customers verify email OTP → emailVerified=true.
 */

import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  formatValidationDetails,
  getSession,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import { z } from "zod";
import {
  findActiveEmailOtpRow,
  incrementEmailOtpAttempt,
  isSixDigitOtp,
  markEmailOtpConsumed,
  normalizeEmailForOtp,
  verifyStoredEmailOtp,
} from "@/lib/auth/email-otp.service";
import { isPlaceholderCustomerEmail } from "@/lib/auth/phone";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";

const verifySchema = z
  .object({
    email: z.string().email().max(255).toLowerCase().trim().optional(),
    otp: z.string().regex(/^\d{6}$/).optional(),
    code: z.string().regex(/^\d{6}$/).optional(),
  })
  .refine((d) => Boolean(d.otp?.trim() || d.code?.trim()), {
    message: "OTP is required",
    path: ["otp"],
  })
  .transform((d) => ({
    email: d.email?.trim().toLowerCase(),
    code: (d.otp ?? d.code ?? "").trim(),
  }));

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") {
    return apiForbidden("Only customer accounts can use this endpoint.");
  }

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

  if (!isSixDigitOtp(parsed.data.code)) {
    return apiBadRequest("Enter the 6-digit OTP from your email.");
  }

  const user = await prisma.user.findFirst({
    where: { id: session.sub, deletedAt: null },
    select: { id: true, email: true, emailVerified: true },
  });
  if (!user) return apiUnauthorized("Not authenticated");

  const emailNorm = normalizeEmailForOtp(parsed.data.email || user.email);
  if (!emailNorm || isPlaceholderCustomerEmail(emailNorm)) {
    return apiBadRequest("Invalid email for verification.");
  }
  if (emailNorm !== user.email.toLowerCase()) {
    return apiBadRequest(
      "Email does not match your profile. Save the email first, then verify."
    );
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
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(user.id);
  const updated = await prisma.user.findFirst({
    where: { id: user.id, deletedAt: null },
    select: { ...CUSTOMER_ONBOARDING_SELECT, emailVerified: true },
  });
  if (!updated) return apiUnauthorized("Not authenticated");

  const token = await signToken({
    sub: updated.id,
    email: updated.email,
    role: "CUSTOMER",
  });

  const response = apiSuccess({
    emailVerified: true,
    message: "Email verified.",
    user: {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      emailVerified: updated.emailVerified,
      ...customerAuthStatusFields({
        phone: updated.phone,
        phoneVerified: updated.phoneVerified,
        profileCompleted: updated.profileCompleted,
        authOnboardingComplete,
      }),
    },
    token,
  });
  setAuthCookie(response, token);
  return response;
});
