import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiConflict,
  apiValidationError,
  apiUnauthorized,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateRegister,
  formatValidationDetails,
  hashPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import {
  verifyEmailRegistrationProof,
  verifyPhoneRegistrationProof,
} from "@/lib/auth/registration-proof";
import { syncCustomerAuthOnboardingComplete } from "@/lib/auth/customer-onboarding";
import { z } from "zod";

/**
 * POST /api/auth/register — email/password registration after email+phone OTP proofs.
 *
 * Requires name, email, password, phone, emailProofToken, phoneProofToken.
 * Creates a complete customer (emailVerified, phoneVerified, authOnboardingComplete).
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

  const proofParse = z
    .object({
      emailProofToken: z.string().min(10, "Verify your email with OTP first"),
      phoneProofToken: z.string().min(10, "Verify your phone with OTP first"),
    })
    .safeParse(body);
  if (!proofParse.success) {
    return apiValidationError(
      "Email and phone must be verified with OTP before creating an account",
      formatValidationDetails(proofParse.error.issues)
    );
  }

  const { email, password, firstName, lastName, phone } = validation.data;
  const { emailProofToken, phoneProofToken } = proofParse.data;

  const phoneNorm = normalizeIndianPhone(phone);
  if (!phoneNorm) {
    return apiBadRequest(INDIAN_MOBILE_HINT);
  }

  const emailProof = await verifyEmailRegistrationProof(emailProofToken, email);
  if (!emailProof.ok) {
    return apiUnauthorized(
      "Email verification expired or invalid. Please verify your email OTP again."
    );
  }

  const phoneProof = await verifyPhoneRegistrationProof(phoneProofToken, phoneNorm);
  if (!phoneProof.ok) {
    return apiUnauthorized(
      "Phone verification expired or invalid. Please verify your phone OTP again."
    );
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

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, emailVerified: true, passwordHash: true },
  });

  if (existing?.emailVerified) {
    return apiConflict("An account with this email already exists");
  }

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
        phoneVerified: true,
        emailVerified: true,
        profileCompleted: true,
        authOnboardingComplete: true,
        verificationToken: null,
        verificationTokenExpires: null,
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
        phoneVerified: true,
        emailVerified: true,
        profileCompleted: true,
        authOnboardingComplete: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
  }

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      phoneVerified: true,
      emailVerified: true,
      profileCompleted: true,
      authOnboardingComplete: true,
    },
  });
  if (!user) {
    return apiBadRequest("Could not create account. Please try again.");
  }

  // Ensure flag matches computed rules (should already be true).
  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(user.id);

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const { getSmsNotificationService } = await import("@/services/sms-notification.service");
  getSmsNotificationService().onCustomerRegistration({
    name: [firstName, lastName].filter(Boolean).join(" ") || email,
    phone: phoneNorm,
  });

  const response = apiSuccess(
    {
      message: "Account created successfully.",
      needsEmailVerification: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        phoneVerified: true,
        emailVerified: true,
        profileCompleted: true,
        authOnboardingComplete,
        role: "CUSTOMER" as const,
      },
      token,
    },
    Status.CREATED
  );
  setAuthCookie(response, token);
  return response;
});
