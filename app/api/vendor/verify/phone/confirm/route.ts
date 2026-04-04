import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest, apiUnauthorized, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { verifyPhoneOtp } from "@/lib/auth/phone-otp-hash";

const MAX_ATTEMPTS = 5;

/**
 * POST /api/vendor/verify/phone/confirm
 * Body: { code: string }
 * Validates OTP and sets phoneVerified = true on the seller.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  let body: unknown;
  try { body = await request.json(); } catch { return apiBadRequest("Invalid JSON body"); }
  const { code } = body as { code?: unknown };
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return apiBadRequest("Enter the 6-digit code you received.");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { phone: true, phoneOtpCode: true, phoneOtpExpires: true },
  });
  if (!seller) return apiBadRequest("Vendor not found");

  const phoneNorm = normalizeIndianPhone(seller.phone?.trim() ?? "");
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  if (!seller.phoneOtpCode || !seller.phoneOtpExpires || seller.phoneOtpExpires < new Date()) {
    return apiUnauthorized("Code expired or not requested. Please send a new OTP first.");
  }

  // Use a simple per-seller attempt counter via a re-fetch trick:
  // If you need brute-force protection add a `phoneOtpAttempts Int @default(0)` field.
  const ok = verifyPhoneOtp(phoneNorm, code.trim(), seller.phoneOtpCode);
  if (!ok) return apiUnauthorized("Incorrect code. Try again.");

  await prisma.seller.update({
    where: { id: sellerId },
    data: { phoneVerified: true, phoneOtpCode: null, phoneOtpExpires: null },
  });

  return apiSuccess({ verified: true, message: "Phone number verified successfully." });
});
