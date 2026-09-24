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
import {
  isCustomerAppRequest,
  setCustomerAppCookie,
} from "@/lib/auth/customer-app-cookie";
import { z } from "zod";

/**
 * POST /api/auth/register — email/password registration after OTP proofs.
 *
 * Website: requires name, email, password, phone + email/phone proof tokens.
 * Customer App (env cookie): phone optional; email proof still required.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const fromCustomerApp = isCustomerAppRequest(request);

  let email: string;
  let password: string;
  let firstName: string | null;
  let lastName: string | null;
  let phoneNorm: string | null = null;
  let phoneVerified = false;

  if (fromCustomerApp) {
    const appParse = z
      .object({
        email: z.string().email().max(255).toLowerCase().trim(),
        password: z
          .string()
          .min(8)
          .max(128)
          .regex(/[A-Z]/)
          .regex(/[a-z]/)
          .regex(/\d/),
        firstName: z.string().max(100).trim().optional(),
        lastName: z.string().max(100).trim().optional(),
        name: z.string().max(200).trim().optional(),
        phone: z.string().max(20).trim().optional(),
        emailProofToken: z.string().min(10, "Verify your email with OTP first"),
        phoneProofToken: z.string().min(10).optional(),
      })
      .superRefine((data, ctx) => {
        const first = data.firstName?.trim() ?? "";
        const last = data.lastName?.trim() ?? "";
        const fullName = data.name?.trim() ?? "";
        if (!first && !last && !fullName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Name is required",
            path: ["firstName"],
          });
        }
      })
      .safeParse(body);

    if (!appParse.success) {
      return apiValidationError(
        "Validation failed",
        formatValidationDetails(appParse.error.issues)
      );
    }

    const data = appParse.data;
    let fn = data.firstName?.trim() || "";
    let ln = data.lastName?.trim() || "";
    const fullName = data.name?.trim() || "";
    if (!fn && !ln && fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      fn = parts[0] ?? "";
      ln = parts.slice(1).join(" ");
    }
    email = data.email;
    password = data.password;
    firstName = fn || null;
    lastName = ln || null;

    const emailProof = await verifyEmailRegistrationProof(data.emailProofToken, email);
    if (!emailProof.ok) {
      return apiUnauthorized(
        "Email verification expired or invalid. Please verify your email OTP again."
      );
    }

    const rawPhone = data.phone?.trim();
    if (rawPhone) {
      phoneNorm = normalizeIndianPhone(rawPhone);
      if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);
      if (!data.phoneProofToken) {
        return apiValidationError("Verify your phone with OTP first", {
          phoneProofToken: "Verify your phone with OTP first",
        });
      }
      const phoneProof = await verifyPhoneRegistrationProof(
        data.phoneProofToken,
        phoneNorm
      );
      if (!phoneProof.ok) {
        return apiUnauthorized(
          "Phone verification expired or invalid. Please verify your phone OTP again."
        );
      }
      phoneVerified = true;
    }
  } else {
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

    const { email: e, password: p, firstName: f, lastName: l, phone } =
      validation.data;
    email = e;
    password = p;
    firstName = f;
    lastName = l;

    phoneNorm = normalizeIndianPhone(phone);
    if (!phoneNorm) {
      return apiBadRequest(INDIAN_MOBILE_HINT);
    }

    const emailProof = await verifyEmailRegistrationProof(
      proofParse.data.emailProofToken,
      email
    );
    if (!emailProof.ok) {
      return apiUnauthorized(
        "Email verification expired or invalid. Please verify your email OTP again."
      );
    }

    const phoneProof = await verifyPhoneRegistrationProof(
      proofParse.data.phoneProofToken,
      phoneNorm
    );
    if (!phoneProof.ok) {
      return apiUnauthorized(
        "Phone verification expired or invalid. Please verify your phone OTP again."
      );
    }
    phoneVerified = true;
  }

  if (phoneNorm) {
    const phoneTaken = await prisma.user.findFirst({
      where: { phone: phoneNorm, deletedAt: null },
      select: { id: true },
    });
    if (phoneTaken) {
      return apiConflict(
        "This phone number is already in use. Sign in with OTP or use a different number."
      );
    }
  }

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, emailVerified: true, passwordHash: true },
  });

  if (existing?.emailVerified) {
    return apiConflict("An account with this email already exists");
  }

  // Strict DB completeness only when phone is verified (Website always; App if provided).
  const willBeStrictComplete = Boolean(phoneNorm && phoneVerified);

  const userData = {
    passwordHash,
    firstName,
    lastName,
    phone: phoneNorm,
    phoneVerified,
    emailVerified: true as const,
    profileCompleted: true as const,
    // Never invent completeness — sync after write.
    authOnboardingComplete: willBeStrictComplete,
    verificationToken: null,
    verificationTokenExpires: null,
  };

  if (existing && !existing.emailVerified) {
    if (existing.passwordHash == null) {
      return apiConflict(
        "This email is already associated with another sign-in method. Please sign in with that method."
      );
    }
    await prisma.user.update({
      where: { id: existing.id },
      data: userData,
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        ...userData,
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

  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(user.id);

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  if (phoneNorm) {
    const { getSmsNotificationService } = await import(
      "@/services/sms-notification.service"
    );
    getSmsNotificationService().onCustomerRegistration({
      name: [firstName, lastName].filter(Boolean).join(" ") || email,
      phone: phoneNorm,
    });
  }

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
        phoneVerified: user.phoneVerified,
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
  if (fromCustomerApp) {
    setCustomerAppCookie(response);
  }
  return response;
});
