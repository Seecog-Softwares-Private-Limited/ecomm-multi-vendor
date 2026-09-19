import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiConflict,
  apiValidationError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateRegister,
  formatValidationDetails,
  hashPassword,
} from "@/lib/auth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { emailConfig, sendCustomerVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 72;

/**
 * POST /api/auth/register — email/password registration.
 *
 * Requires name, email, password, phone.
 * Creates an incomplete user (emailVerified=false, phoneVerified=false,
 * authOnboardingComplete=false). Sends the existing email verification link.
 * No session cookie until the customer verifies email and later verifies phone OTP.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validateRegister(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const { email, password, firstName, lastName, phone } = validation.data;

  const phoneNorm = normalizeIndianPhone(phone);
  if (!phoneNorm) {
    return apiBadRequest(INDIAN_MOBILE_HINT);
  }

  const phoneTaken = await prisma.user.findFirst({
    where: { phone: phoneNorm, deletedAt: null },
    select: { id: true },
  });
  if (phoneTaken) {
    return apiConflict(
      "This phone number is already in use. Sign in with OTP or use a different number."
    );
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  const verificationTokenExpires = new Date(
    Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
  );

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, emailVerified: true, passwordHash: true },
  });

  if (existing?.emailVerified) {
    return apiConflict("An account with this email already exists");
  }

  // Unverified email/password draft: allow re-register to refresh credentials + phone.
  // Do not overwrite a phone-first / Google account that happens to share an unverified placeholder path.
  if (existing && !existing.emailVerified) {
    if (existing.passwordHash == null) {
      return apiConflict(
        "This email is already associated with another sign-in method. Please sign in with that method."
      );
    }
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        firstName,
        lastName,
        phone: phoneNorm,
        phoneVerified: false,
        emailVerified: false,
        profileCompleted: false,
        authOnboardingComplete: false,
        verificationToken,
        verificationTokenExpires,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phoneNorm,
        phoneVerified: false,
        emailVerified: false,
        profileCompleted: false,
        authOnboardingComplete: false,
        verificationToken,
        verificationTokenExpires,
      },
    });
  }

  const emailResult = await sendCustomerVerificationEmail(email, verificationToken);
  const appUrl =
    emailConfig.appUrl.replace(/\/$/, "") ||
    `http://localhost:${process.env.PORT ?? "3000"}`;
  const verificationLink = `${appUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  const payload: {
    needsEmailVerification: true;
    message: string;
    emailSent: boolean;
    verificationLink?: string;
  } = {
    needsEmailVerification: true,
    message: emailResult.sent
      ? "Check your email and confirm your sign-up using the link we sent."
      : "Account created. We could not send email (SMTP not configured). Use the verification link shown below in development.",
    emailSent: emailResult.sent,
  };

  if (!emailResult.sent && process.env.NODE_ENV === "development") {
    payload.verificationLink = verificationLink;
  }

  const { getSmsNotificationService } = await import("@/services/sms-notification.service");
  getSmsNotificationService().onCustomerRegistration({
    name: [firstName, lastName].filter(Boolean).join(" ") || email,
    phone: phoneNorm,
  });

  return apiSuccess(payload, Status.CREATED);
});
