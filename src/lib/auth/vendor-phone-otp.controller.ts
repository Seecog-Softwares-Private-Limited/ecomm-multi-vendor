/**
 * Vendor phone-first auth via MSG91 (separate from Customer BlackSMS OTP).
 * POST /api/auth/vendor-phone-otp/send
 * POST /api/auth/vendor-phone-otp/verify
 */

import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { SellerStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiError,
  apiValidationError,
  Status,
} from "@/lib/api";
import {
  validatePhoneOtpSend,
  validatePhoneOtpVerify,
  formatValidationDetails,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import {
  sendOtp,
  verifyOtp,
  isMsg91OtpConfigured,
  PHONE_OTP_MSG91_MARKER,
} from "@/lib/sms/msg91-otp";
import { prisma } from "@/lib/prisma";
import {
  findActiveSellerByPhoneNorm,
  placeholderEmailForVendorPhoneNorm,
  sellerAuthStatusFields,
  syncSellerAuthOnboardingComplete,
} from "@/lib/auth/seller-onboarding";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_WINDOW_MS = 10 * 60_000;

async function ensureIncompleteSellerForPhone(phoneNorm: string) {
  const existing = await findActiveSellerByPhoneNorm(phoneNorm);
  if (existing) return existing;

  const email = placeholderEmailForVendorPhoneNorm(phoneNorm);
  try {
    return await prisma.seller.create({
      data: {
        email,
        passwordHash: null,
        businessName: "Pending",
        ownerName: "Pending",
        phone: phoneNorm,
        status: SellerStatus.DRAFT,
        emailVerified: false,
        phoneVerified: false,
        authOnboardingComplete: false,
      },
      select: {
        id: true,
        email: true,
        ownerName: true,
        businessName: true,
        phone: true,
        phoneVerified: true,
        emailVerified: true,
        authOnboardingComplete: true,
        oauthProvider: true,
        oauthProviderId: true,
        appleUserId: true,
        passwordHash: true,
        status: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const raced = await findActiveSellerByPhoneNorm(phoneNorm);
      if (raced) return raced;
    }
    throw err;
  }
}

/** POST /api/auth/vendor-phone-otp/send — body: { phone, resend? } */
export const POST_VENDOR_SEND_OTP = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validatePhoneOtpSend(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const phoneNorm = normalizeIndianPhone(validation.data.phone);
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  if (!isMsg91OtpConfigured()) {
    return apiError(
      "SMS OTP is not configured on this server. Set MSG91_AUTH_KEY in the environment used by the Node process.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  const seller = await ensureIncompleteSellerForPhone(phoneNorm);

  if (
    seller &&
    (await prisma.seller.findFirst({
      where: { id: seller.id },
      select: { phoneOtpExpires: true },
    }))
  ) {
    const row = await prisma.seller.findFirst({
      where: { id: seller.id },
      select: { phoneOtpExpires: true },
    });
    if (
      row?.phoneOtpExpires &&
      row.phoneOtpExpires.getTime() > Date.now() + OTP_WINDOW_MS - RESEND_COOLDOWN_MS
    ) {
      return apiError(
        "Please wait a minute before requesting another code.",
        Status.TOO_MANY_REQUESTS,
        "TOO_MANY_REQUESTS"
      );
    }
  }

  const out = await sendOtp(phoneNorm);
  if (!out.success) {
    return apiError(
      process.env.NODE_ENV === "development" && out.error
        ? out.error
        : "SMS could not be sent. Check MSG91 template and account.",
      Status.BAD_GATEWAY,
      "SMS_SEND_FAILED"
    );
  }

  const expiresAt = new Date(Date.now() + OTP_WINDOW_MS);
  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      phone: phoneNorm,
      phoneOtpCode: PHONE_OTP_MSG91_MARKER,
      phoneOtpExpires: expiresAt,
    },
  });

  const masked = phoneNorm.length >= 10 ? "xxxxxx" + phoneNorm.slice(-4) : "xxxxxx";
  return apiSuccess({
    message: `Verification code sent to ${masked}.`,
    expiresInSeconds: Math.floor(OTP_WINDOW_MS / 1000),
    smsSent: true as const,
  });
});

/** POST /api/auth/vendor-phone-otp/verify — body: { phone, otp|code } */
export const POST_VENDOR_VERIFY_OTP = withApiHandler(async (request: NextRequest) => {
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
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  const seller = await findActiveSellerByPhoneNorm(phoneNorm);
  if (!seller) {
    return apiBadRequest("Please request an OTP first.");
  }

  const row = await prisma.seller.findFirst({
    where: { id: seller.id, deletedAt: null },
    select: {
      id: true,
      email: true,
      businessName: true,
      ownerName: true,
      status: true,
      phoneOtpCode: true,
      phoneOtpExpires: true,
    },
  });
  if (!row) return apiBadRequest("Vendor not found");

  if (!row.phoneOtpExpires || row.phoneOtpExpires < new Date()) {
    return apiError("Code expired or not requested. Please send a new OTP first.", Status.UNAUTHORIZED, "UNAUTHORIZED");
  }
  if (row.phoneOtpCode !== PHONE_OTP_MSG91_MARKER) {
    return apiError("Please request a new verification code and try again.", Status.UNAUTHORIZED, "UNAUTHORIZED");
  }

  const v = await verifyOtp(phoneNorm, validation.data.code);
  if (!v.success) {
    return apiError("Incorrect code. Try again.", Status.UNAUTHORIZED, "UNAUTHORIZED");
  }

  await prisma.seller.update({
    where: { id: row.id },
    data: {
      phone: phoneNorm,
      phoneVerified: true,
      phoneOtpCode: null,
      phoneOtpExpires: null,
    },
  });

  const authOnboardingComplete = await syncSellerAuthOnboardingComplete(row.id);
  const fresh = await prisma.seller.findFirst({
    where: { id: row.id },
    select: {
      id: true,
      email: true,
      businessName: true,
      ownerName: true,
      status: true,
      phone: true,
      phoneVerified: true,
      emailVerified: true,
      authOnboardingComplete: true,
    },
  });

  const token = await signToken({
    sub: row.id,
    email: row.email,
    role: "SELLER",
  });

  const response = apiSuccess({
    vendor: {
      id: fresh?.id ?? row.id,
      email: fresh?.email ?? row.email,
      businessName: fresh?.businessName ?? row.businessName,
      ownerName: fresh?.ownerName ?? row.ownerName,
      status: fresh?.status ?? row.status,
      role: "SELLER",
      ...sellerAuthStatusFields({
        phone: fresh?.phone ?? phoneNorm,
        phoneVerified: fresh?.phoneVerified ?? true,
        emailVerified: fresh?.emailVerified ?? false,
        authOnboardingComplete,
      }),
    },
  });
  setAuthCookie(response, token);
  return response;
});
