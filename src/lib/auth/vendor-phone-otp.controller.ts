/**
 * Vendor phone OTP via BlackSMS (same provider as Customer login OTP).
 * App generates a 6-digit code, stores HMAC on Seller.phoneOtpCode, sends SMS via BlackSMS.
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
  apiUnauthorized,
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
import { hashPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone-otp-hash";
import {
  generateOtpCode,
  isDevConsoleOtpAllowed,
  isSixDigitOtp,
  OTP_EXPIRY_MS,
  resolveOtpProvider,
} from "@/lib/auth/otp.service";
import { isSmsProviderConfigured } from "@/lib/sendSMS";
import { deliverCustomerLoginOtp } from "@/sms/otp-delivery";
import { prisma } from "@/lib/prisma";
import {
  findActiveSellerByPhoneNorm,
  placeholderEmailForVendorPhoneNorm,
  sellerAuthStatusFields,
  syncSellerAuthOnboardingComplete,
} from "@/lib/auth/seller-onboarding";

const RESEND_COOLDOWN_MS = 60_000;

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

function blacksmsReady(): boolean {
  const provider = resolveOtpProvider();
  return provider === "blacksms" || provider === "dev_console";
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

  if (!blacksmsReady()) {
    return apiError(
      process.env.NODE_ENV === "production"
        ? "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID on the server."
        : "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID, or OTP_DEV_CONSOLE=true for local testing.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  const seller = await ensureIncompleteSellerForPhone(phoneNorm);

  const row = await prisma.seller.findFirst({
    where: { id: seller.id },
    select: { phoneOtpExpires: true },
  });
  if (
    row?.phoneOtpExpires &&
    row.phoneOtpExpires.getTime() > Date.now() + OTP_EXPIRY_MS - RESEND_COOLDOWN_MS
  ) {
    return apiError(
      "Please wait a minute before requesting another code.",
      Status.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS"
    );
  }

  const plainOtp = generateOtpCode();
  const codeHash = hashPhoneOtp(phoneNorm, plainOtp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const provider = resolveOtpProvider();

  if (provider === "dev_console") {
    console.info(
      `[vendor-phone-otp][DEV] OTP for ***${phoneNorm.slice(-4)}: ${plainOtp} (expires in ${OTP_EXPIRY_MS / 1000}s)`
    );
  } else {
    if (!isSmsProviderConfigured()) {
      return apiError(
        "SMS is not configured. Add BLACKSMS_API_KEY and BLACKSMS_SENDER_ID to the server environment.",
        Status.SERVICE_UNAVAILABLE,
        "SMS_NOT_CONFIGURED"
      );
    }

    let sms: { success: boolean; error?: string };
    try {
      sms = await deliverCustomerLoginOtp(phoneNorm, plainOtp);
    } catch (e) {
      console.error("[vendor-phone-otp] Unexpected error while sending SMS", e);
      return apiError(
        process.env.NODE_ENV === "development"
          ? `SMS failed: ${e instanceof Error ? e.message : String(e)}`
          : "We could not send the verification code. Try again in a few minutes.",
        Status.BAD_GATEWAY,
        "SMS_SEND_FAILED"
      );
    }

    if (!sms.success) {
      const userMessage =
        process.env.NODE_ENV === "development" && sms.error
          ? `SMS failed: ${sms.error}`
          : "We could not send the verification code. Try again in a few minutes.";
      console.error("[vendor-phone-otp] BlackSMS send failed:", sms.error);
      return apiError(userMessage, Status.BAD_GATEWAY, "SMS_SEND_FAILED");
    }

    console.info(`[vendor-phone-otp] BlackSMS OTP sent for ***${phoneNorm.slice(-4)}`);
  }

  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      phone: phoneNorm,
      phoneOtpCode: codeHash,
      phoneOtpExpires: expiresAt,
    },
  });

  const masked = phoneNorm.length >= 10 ? "xxxxxx" + phoneNorm.slice(-4) : "xxxxxx";
  const isResend = validation.data.resend === true;
  return apiSuccess({
    message: isResend
      ? `A new verification code has been sent to ${masked}.`
      : `Verification code sent to ${masked}.`,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    smsSent: provider !== "dev_console",
    ...(isResend ? { resent: true as const } : {}),
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

  const code = validation.data.code.trim();
  if (!isSixDigitOtp(code)) {
    return apiBadRequest("Enter the 6-digit OTP from your SMS.");
  }

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
    return apiUnauthorized("Code expired or not requested. Please send a new OTP first.");
  }
  if (!row.phoneOtpCode) {
    return apiUnauthorized("Please request a new verification code and try again.");
  }

  // Reject leftover MSG91 session markers from older builds.
  if (row.phoneOtpCode === "__msg91_sendotp__") {
    return apiUnauthorized("Please request a new verification code and try again.");
  }

  if (!verifyPhoneOtp(phoneNorm, code, row.phoneOtpCode)) {
    return apiUnauthorized("Incorrect code. Try again.");
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
