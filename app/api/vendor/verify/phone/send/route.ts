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
import { hashPhoneOtp } from "@/lib/auth/phone-otp-hash";
import {
  generateOtpCode,
  OTP_EXPIRY_MS,
  resolveOtpProvider,
} from "@/lib/auth/otp.service";
import { isSmsProviderConfigured } from "@/lib/sendSMS";
import { deliverCustomerLoginOtp } from "@/sms/otp-delivery";
import { findActiveSellersByPhoneNorm, PHONE_ACCOUNT_CONFLICT_CODE, PHONE_ACCOUNT_CONFLICT_MESSAGE } from "@/lib/auth/seller-onboarding";

const RESEND_COOLDOWN_MS = 60_000;

/**
 * POST /api/vendor/verify/phone/send
 * BlackSMS OTP for authenticated vendor (same provider as Customer).
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

  const others = (await findActiveSellersByPhoneNorm(phoneNorm)).filter(
    (s) => s.id !== sellerId
  );
  if (others.length > 1) {
    return apiError(
      PHONE_ACCOUNT_CONFLICT_MESSAGE,
      Status.CONFLICT,
      PHONE_ACCOUNT_CONFLICT_CODE
    );
  }
  if (others.length === 1) {
    return apiConflict(
      "This phone number is already registered with another vendor account."
    );
  }

  if (
    seller.phoneOtpExpires &&
    seller.phoneOtpExpires.getTime() > Date.now() + OTP_EXPIRY_MS - RESEND_COOLDOWN_MS
  ) {
    return apiError(
      "Please wait a minute before requesting another code.",
      Status.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS"
    );
  }

  const provider = resolveOtpProvider();
  if (provider !== "blacksms" && provider !== "dev_console") {
    return apiError(
      process.env.NODE_ENV === "production"
        ? "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID on the server."
        : "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID, or OTP_DEV_CONSOLE=true for local testing.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  const plainOtp = generateOtpCode();
  const codeHash = hashPhoneOtp(phoneNorm, plainOtp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  if (provider === "dev_console") {
    console.info(
      `[vendor-verify-phone][DEV] OTP for ***${phoneNorm.slice(-4)}: ${plainOtp}`
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
      console.error("[vendor-verify-phone] Unexpected SMS error", e);
      return apiError(
        process.env.NODE_ENV === "development"
          ? `SMS failed: ${e instanceof Error ? e.message : String(e)}`
          : "We could not send the verification code. Try again in a few minutes.",
        Status.BAD_GATEWAY,
        "SMS_SEND_FAILED"
      );
    }
    if (!sms.success) {
      console.error("[vendor-verify-phone] BlackSMS failed:", sms.error);
      return apiError(
        process.env.NODE_ENV === "development" && sms.error
          ? `SMS failed: ${sms.error}`
          : "We could not send the verification code. Try again in a few minutes.",
        Status.BAD_GATEWAY,
        "SMS_SEND_FAILED"
      );
    }
  }

  await prisma.seller.update({
    where: { id: sellerId },
    data: {
      phone: phoneNorm,
      phoneVerified: false,
      phoneOtpCode: codeHash,
      phoneOtpExpires: expiresAt,
    },
  });

  const masked =
    phoneNorm.length >= 10 ? "xxxxxx" + phoneNorm.slice(-4) : "xxxxxx";

  return apiSuccess({
    message: `Verification code sent to ${masked}.`,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    smsSent: provider !== "dev_console",
  });
});
