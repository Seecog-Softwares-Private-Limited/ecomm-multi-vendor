import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiError,
  apiForbidden,
  Status,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import {
  sendOtp,
  isMsg91OtpConfigured,
  PHONE_OTP_MSG91_MARKER,
} from "@/lib/sms/msg91-otp";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_WINDOW_MS = 10 * 60_000;

/**
 * POST /api/vendor/verify/phone/send
 * Sends an OTP to the phone number on the seller profile (MSG91 — OTP not stored server-side).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { phone: true, phoneOtpExpires: true },
  });
  if (!seller) return apiBadRequest("Vendor not found");

  const phoneRaw = seller.phone?.trim();
  if (!phoneRaw) {
    return apiBadRequest("Please save a mobile number in your profile before verifying.");
  }

  const phoneNorm = normalizeIndianPhone(phoneRaw);
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  if (
    seller.phoneOtpExpires &&
    seller.phoneOtpExpires.getTime() > Date.now() + OTP_WINDOW_MS - RESEND_COOLDOWN_MS
  ) {
    return apiError(
      "Please wait a minute before requesting another code.",
      Status.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS"
    );
  }

  if (!isMsg91OtpConfigured()) {
    return apiError(
      "SMS OTP is not configured on this server. Set MSG91_AUTH_KEY in the environment used by the Node process.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
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
    where: { id: sellerId },
    data: {
      phoneOtpCode: PHONE_OTP_MSG91_MARKER,
      phoneOtpExpires: expiresAt,
    },
  });

  const masked =
    phoneNorm.length >= 10 ? "xxxxxx" + phoneNorm.slice(-4) : "xxxxxx";

  return apiSuccess({
    message: `Verification code sent to ${masked}.`,
    expiresInSeconds: Math.floor(OTP_WINDOW_MS / 1000),
    smsSent: true as const,
  });
});
