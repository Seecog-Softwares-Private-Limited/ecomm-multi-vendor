import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { verifyOtp, PHONE_OTP_MSG91_MARKER } from "@/lib/sms/msg91-otp";

/**
 * POST /api/vendor/verify/phone/confirm
 * Body: { code: string } — verified with MSG91, not a DB-stored hash.
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
  if (typeof code !== "string" || !/^\d{4,9}$/.test(code.trim())) {
    return apiBadRequest("Enter the verification code you received by SMS.");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { phone: true, phoneOtpCode: true, phoneOtpExpires: true },
  });
  if (!seller) return apiBadRequest("Vendor not found");

  const phoneNorm = normalizeIndianPhone(seller.phone?.trim() ?? "");
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  if (!seller.phoneOtpExpires || seller.phoneOtpExpires < new Date()) {
    return apiUnauthorized("Code expired or not requested. Please send a new OTP first.");
  }

  if (seller.phoneOtpCode !== PHONE_OTP_MSG91_MARKER) {
    return apiUnauthorized("Please request a new verification code and try again.");
  }

  const v = await verifyOtp(phoneNorm, code.trim());
  if (!v.success) {
    return apiUnauthorized("Incorrect code. Try again.");
  }

  await prisma.seller.update({
    where: { id: sellerId },
    data: {
      phoneVerified: true,
      phoneOtpCode: null,
      phoneOtpExpires: null,
    },
  });

  return apiSuccess({ verified: true, message: "Phone number verified successfully." });
});
