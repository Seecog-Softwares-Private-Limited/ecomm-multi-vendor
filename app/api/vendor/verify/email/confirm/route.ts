import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest, apiUnauthorized, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPhoneOtp } from "@/lib/auth/phone-otp-hash";

/**
 * POST /api/vendor/verify/email/confirm
 * Body: { code: string }
 * Validates OTP and sets emailVerified = true on the seller.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  let body: unknown;
  try { body = await request.json(); } catch { return apiBadRequest("Invalid JSON body"); }
  const { code } = body as { code?: unknown };
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return apiBadRequest("Enter the 6-digit code from your email.");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { emailOtpCode: true, emailOtpExpires: true },
  });
  if (!seller) return apiBadRequest("Vendor not found");

  if (!seller.emailOtpCode || !seller.emailOtpExpires || seller.emailOtpExpires < new Date()) {
    return apiUnauthorized("Code expired or not requested. Please send a new OTP first.");
  }

  const ok = verifyPhoneOtp(sellerId, code.trim(), seller.emailOtpCode);
  if (!ok) return apiUnauthorized("Incorrect code. Try again.");

  await prisma.seller.update({
    where: { id: sellerId },
    data: { emailVerified: true, emailOtpCode: null, emailOtpExpires: null },
  });

  return apiSuccess({ verified: true, message: "Email address verified successfully." });
});
