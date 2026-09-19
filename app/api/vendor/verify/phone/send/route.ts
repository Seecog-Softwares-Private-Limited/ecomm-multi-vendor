import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiError,
  apiForbidden,
  apiConflict,
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
import { findActiveSellerByPhoneNorm } from "@/lib/auth/seller-onboarding";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_WINDOW_MS = 10 * 60_000;

/**
 * POST /api/vendor/verify/phone/send
 * MSG91 OTP for authenticated vendor.
 * Body optional: { phone?, resend? } — phone allowed when incomplete and not yet verified.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  let body: Record<string, unknown> = {};
  try {
    const raw = await request.json();
    if (raw && typeof raw === "object") body = raw as Record<string, unknown>;
  } catch {
    /* empty body ok */
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: {
      phone: true,
      phoneVerified: true,
      phoneOtpExpires: true,
      authOnboardingComplete: true,
    },
  });
  if (!seller) return apiBadRequest("Vendor not found");

  let phoneRaw = seller.phone?.trim() ?? "";
  const bodyPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (bodyPhone) {
    if (seller.phoneVerified && seller.phone?.trim()) {
      return apiBadRequest("Phone is already verified. Contact support to change it.");
    }
    phoneRaw = bodyPhone;
  }

  if (!phoneRaw) {
    return apiBadRequest("Please enter a mobile number to verify.");
  }

  const phoneNorm = normalizeIndianPhone(phoneRaw);
  if (!phoneNorm) return apiBadRequest(INDIAN_MOBILE_HINT);

  const other = await findActiveSellerByPhoneNorm(phoneNorm);
  if (other && other.id !== sellerId) {
    return apiConflict(
      "This phone number is already registered with another vendor account."
    );
  }

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
      phone: phoneNorm,
      phoneVerified: false,
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
