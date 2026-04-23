import { randomInt } from "crypto";
import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest, apiError, apiForbidden, Status } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, phoneNormToE164, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { hashPhoneOtp } from "@/lib/auth/phone-otp-hash";
import { sendLoginOtpSms, isSmsProviderConfigured } from "@/lib/sms/send-login-otp";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_EXPIRY_MS = 10 * 60_000;

/**
 * POST /api/vendor/verify/phone/send
 * Sends a 6-digit OTP to the phone number saved on the seller's profile.
 * Requires an active vendor session.
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

  // Rate-limit: one OTP per minute
  if (seller.phoneOtpExpires && seller.phoneOtpExpires.getTime() > Date.now() + OTP_EXPIRY_MS - RESEND_COOLDOWN_MS) {
    return apiError("Please wait a minute before requesting another code.", Status.TOO_MANY_REQUESTS, "TOO_MANY_REQUESTS");
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = hashPhoneOtp(phoneNorm, code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  const e164 = phoneNormToE164(phoneNorm);
  const providerConfigured = isSmsProviderConfigured();
  const sms = await sendLoginOtpSms(e164, code);

  if (!sms.sent && providerConfigured) {
    return apiError(
      "SMS could not be sent. Check your SMS provider configuration.",
      Status.BAD_GATEWAY,
      "SMS_SEND_FAILED"
    );
  }

  if (!sms.sent && !providerConfigured && process.env.NODE_ENV === "production") {
    return apiError(
      "SMS is not configured on this server. Set BREVO_API_KEY in the environment used by the Node process.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  await prisma.seller.update({
    where: { id: sellerId },
    data: { phoneOtpCode: codeHash, phoneOtpExpires: expiresAt },
  });

  const masked = phoneNorm.length >= 10
    ? "xxxxxx" + phoneNorm.slice(-4)
    : "xxxxxx";

  return apiSuccess({
    message: providerConfigured && sms.sent
      ? `Verification code sent to ${masked}.`
      : "No SMS provider configured — use the code below (dev only).",
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    smsSent: sms.sent,
    ...(process.env.NODE_ENV !== "production" ? { devOtp: code } : {}),
  });
});
