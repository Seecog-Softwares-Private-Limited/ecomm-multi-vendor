import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validatePhoneOtpVerify,
  formatValidationDetails,
  hashPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import {
  normalizeIndianPhone,
  syntheticEmailForPhoneNorm,
  INDIAN_MOBILE_HINT,
} from "@/lib/auth/phone";
import { verifyPhoneOtp } from "@/lib/auth/phone-otp-hash";

const MAX_ATTEMPTS = 5;

export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validatePhoneOtpVerify(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const phoneNorm = normalizeIndianPhone(validation.data.phone);
  if (!phoneNorm) {
    return apiBadRequest(INDIAN_MOBILE_HINT);
  }

  const { code } = validation.data;

  const row = await prisma.customerPhoneOtp.findFirst({
    where: {
      phoneNorm,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return apiUnauthorized("Code expired or invalid. Request a new OTP.");
  }

  if (row.attemptCount >= MAX_ATTEMPTS) {
    return apiUnauthorized("Too many wrong attempts. Request a new OTP.");
  }

  const ok = verifyPhoneOtp(phoneNorm, code, row.codeHash);
  if (!ok) {
    await prisma.customerPhoneOtp.update({
      where: { id: row.id },
      data: { attemptCount: { increment: 1 } },
    });
    return apiUnauthorized("Incorrect code. Try again.");
  }

  await prisma.customerPhoneOtp.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });

  let user = await prisma.user.findFirst({
    where: { phone: phoneNorm, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
    },
  });

  if (!user) {
    const email = syntheticEmailForPhoneNorm(phoneNorm);
    const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone: phoneNorm,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
      },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
    user = { ...user, emailVerified: true };
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const response = apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: "CUSTOMER" as const,
    },
  });

  setAuthCookie(response, token);
  return response;
});
