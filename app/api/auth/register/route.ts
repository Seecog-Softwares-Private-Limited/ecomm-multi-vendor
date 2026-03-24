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
import { emailConfig, sendCustomerVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 72;

/**
 * POST /api/auth/register — create customer account; sends email to confirm sign-up.
 * No session cookie until the user verifies via link (/verify-email?token=...).
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

  const passwordHash = await hashPassword(password);
  const verificationToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, emailVerified: true },
  });

  if (existing?.emailVerified) {
    return apiConflict("An account with this email already exists");
  }

  if (existing && !existing.emailVerified) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        phone: phone ?? null,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        phone: phone ?? null,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      },
    });
  }

  const emailResult = await sendCustomerVerificationEmail(email, verificationToken);
  const appUrl = emailConfig.appUrl.replace(/\/$/, "") || `http://localhost:${process.env.PORT ?? "3000"}`;
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

  return apiSuccess(payload, Status.CREATED);
});
