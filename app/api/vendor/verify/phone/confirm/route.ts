import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiForbidden,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { verifyPhoneOtp } from "@/lib/auth/phone-otp-hash";
import { isSixDigitOtp } from "@/lib/auth/otp.service";

/**
 * POST /api/vendor/verify/phone/confirm
 * Body: { code: string } — verified against HMAC stored on Seller (BlackSMS flow).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const { code } = body as { code?: unknown };
  if (typeof code !== "string" || !isSixDigitOtp(code.trim())) {
    return apiBadRequest("Enter the 6-digit verification code you received by SMS.");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { phone: true, phoneOtpCode: true, phoneOtpExpires: true },
  });
  if (!seller) return apiBadRequest("Vendor not found");

  const phoneNorm = normalizeIndianPhone(seller.phone?.trim() ?? "");
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  if (!seller.phoneOtpExpires || seller.phoneOtpExpires < new Date()) {
    return apiBadRequest("Code expired or not requested. Please send a new OTP first.");
  }

  if (!seller.phoneOtpCode || seller.phoneOtpCode === "__msg91_sendotp__") {
    return apiBadRequest("Please request a new verification code and try again.");
  }

  if (!verifyPhoneOtp(phoneNorm, code.trim(), seller.phoneOtpCode)) {
    return apiBadRequest("Incorrect code. Try again.");
  }

  await prisma.seller.update({
    where: { id: sellerId },
    data: {
      phoneVerified: true,
      phoneOtpCode: null,
      phoneOtpExpires: null,
    },
  });

  const { syncSellerAuthOnboardingComplete, sellerAuthStatusFields } = await import(
    "@/lib/auth/seller-onboarding"
  );
  const authOnboardingComplete = await syncSellerAuthOnboardingComplete(sellerId);
  const fresh = await prisma.seller.findFirst({
    where: { id: sellerId },
    select: {
      phone: true,
      phoneVerified: true,
      emailVerified: true,
      authOnboardingComplete: true,
    },
  });

  return apiSuccess({
    verified: true,
    message: "Phone number verified successfully.",
    ...sellerAuthStatusFields({
      phone: fresh?.phone ?? null,
      phoneVerified: fresh?.phoneVerified ?? true,
      emailVerified: fresh?.emailVerified ?? false,
      authOnboardingComplete,
    }),
  });
});
