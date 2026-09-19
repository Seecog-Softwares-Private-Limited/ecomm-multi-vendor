/**
 * Customer registration phone OTP (send / verify).
 * Reuses CustomerPhoneOtp + BlackSMS. Does NOT create/login a User.
 * Issues a short-lived registration proof on success.
 */

import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiConflict,
  apiUnauthorized,
  apiError,
  apiValidationError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  formatValidationDetails,
  validatePhoneOtpSend,
  validatePhoneOtpVerify,
} from "@/lib/auth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import {
  checkOtpSendRateLimit,
  findActiveOtpRow,
  generateOtpCode,
  incrementOtpAttempt,
  invalidatePendingOtps,
  isDevConsoleOtpAllowed,
  isMsg91BackedRow,
  isSixDigitOtp,
  markOtpConsumed,
  OTP_EXPIRY_MS,
  resolveOtpProvider,
  storeOtpHash,
  verifyStoredOtp,
} from "@/lib/auth/otp.service";
import { deliverCustomerLoginOtp } from "@/sms/otp-delivery";
import { isSmsProviderConfigured } from "@/lib/sendSMS";
import {
  sendOtp as msg91SendOtp,
  verifyOtp as msg91VerifyOtp,
  isMsg91OtpConfigured,
  PHONE_OTP_MSG91_MARKER,
} from "@/lib/sms/msg91-otp";
import { signPhoneRegistrationProof } from "@/lib/auth/registration-proof";
import { randomUUID } from "crypto";

/** POST /api/auth/register/phone-otp/send */
export const POST_REGISTER_PHONE_OTP_SEND = withApiHandler(
  async (request: NextRequest) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiBadRequest("Invalid JSON body");
    }

    const validation = validatePhoneOtpSend(body);
    if (!validation.success) {
      return apiValidationError(
        "Validation failed",
        formatValidationDetails(validation.errors)
      );
    }

    const phoneNorm = normalizeIndianPhone(validation.data.phone);
    if (!phoneNorm) {
      return apiBadRequest(INDIAN_MOBILE_HINT);
    }

    const phoneTaken = await prisma.user.findFirst({
      where: { phone: phoneNorm, deletedAt: null },
      select: { id: true },
    });
    if (phoneTaken) {
      return apiConflict(
        "This phone number is already registered. Sign in with OTP or use a different number."
      );
    }

    const isResend = validation.data.resend === true;
    const rate = await checkOtpSendRateLimit(phoneNorm);
    if (!rate.allowed) {
      if (rate.reason === "cooldown") {
        return apiError(
          isResend
            ? "Please wait before requesting another code."
            : "Please wait a minute before requesting another code.",
          Status.TOO_MANY_REQUESTS
        );
      }
      return apiError(
        "Too many OTP requests for this number. Try again later.",
        Status.TOO_MANY_REQUESTS
      );
    }

    const provider = resolveOtpProvider();
    if (!provider) {
      return apiError(
        isSmsProviderConfigured() || isMsg91OtpConfigured()
          ? "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID (or MSG91_AUTH_KEY) on the server."
          : "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID, MSG91_AUTH_KEY, or OTP_DEV_CONSOLE=true for local testing.",
        Status.SERVICE_UNAVAILABLE
      );
    }

    if (provider === "blacksms" || provider === "dev_console") {
      const plainOtp = generateOtpCode();
      await invalidatePendingOtps(phoneNorm);
      await storeOtpHash(phoneNorm, plainOtp);

      if (provider === "dev_console") {
        const tail = phoneNorm.slice(-4);
        console.info(
          `[register-phone-otp][DEV] OTP for ***${tail} (expires in ${OTP_EXPIRY_MS / 1000}s)`
        );
      } else {
        const sms = await deliverCustomerLoginOtp(phoneNorm, plainOtp);
        if (!sms.success) {
          console.error("[register-phone-otp] BlackSMS OTP send failed:", sms.error);
          return apiError(
            sms.error ?? "Could not send OTP SMS. Try again.",
            Status.SERVICE_UNAVAILABLE
          );
        }
      }

      return apiSuccess({
        message: "OTP sent successfully",
        expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
        smsSent: provider === "blacksms",
        resent: isResend || undefined,
      });
    }

    // MSG91 path
    const out = await msg91SendOtp(phoneNorm);
    if (!out.success) {
      console.error("[register-phone-otp] MSG91 send failed:", out.error);
      return apiError(out.error ?? "Could not send OTP.", Status.SERVICE_UNAVAILABLE);
    }
    await invalidatePendingOtps(phoneNorm);
    await prisma.customerPhoneOtp.create({
      data: {
        id: randomUUID(),
        phoneNorm,
        codeHash: PHONE_OTP_MSG91_MARKER,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        attemptCount: 0,
      },
    });

    return apiSuccess({
      message: "OTP sent successfully",
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      smsSent: true,
      resent: isResend || undefined,
    });
  }
);

/** POST /api/auth/register/phone-otp/verify */
export const POST_REGISTER_PHONE_OTP_VERIFY = withApiHandler(
  async (request: NextRequest) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiBadRequest("Invalid JSON body");
    }

    const validation = validatePhoneOtpVerify(body);
    if (!validation.success) {
      return apiValidationError(
        "Validation failed",
        formatValidationDetails(validation.errors)
      );
    }

    const phoneNorm = normalizeIndianPhone(validation.data.phone);
    if (!phoneNorm) {
      return apiBadRequest(INDIAN_MOBILE_HINT);
    }

    const phoneTaken = await prisma.user.findFirst({
      where: { phone: phoneNorm, deletedAt: null },
      select: { id: true },
    });
    if (phoneTaken) {
      return apiConflict(
        "This phone number is already registered. Sign in with OTP or use a different number."
      );
    }

    const code = validation.data.code;
    const row = await findActiveOtpRow(phoneNorm);
    if (!row) {
      return apiUnauthorized("Code expired or invalid. Request a new OTP.");
    }

    if (isMsg91BackedRow(row.codeHash)) {
      if (!isMsg91OtpConfigured()) {
        return apiError("SMS OTP is not configured.", Status.SERVICE_UNAVAILABLE);
      }
      const out = await msg91VerifyOtp(phoneNorm, code);
      if (!out.success) {
        await incrementOtpAttempt(row.id);
        if (row.attemptCount + 1 >= 5) {
          return apiUnauthorized("Too many wrong attempts. Request a new OTP.");
        }
        return apiUnauthorized(out.error ?? "Code expired or invalid. Request a new OTP.");
      }
      await markOtpConsumed(row.id);
      const phoneProofToken = await signPhoneRegistrationProof(phoneNorm, row.id);
      return apiSuccess({
        phoneVerified: true,
        phone: phoneNorm,
        phoneProofToken,
        message: "Phone verified.",
      });
    }

    if (!isSixDigitOtp(code)) {
      return apiBadRequest("Enter the 6-digit OTP from your SMS.");
    }

    const result = verifyStoredOtp(row, code);
    if (!result.valid) {
      if (result.reason === "wrong_code") {
        await incrementOtpAttempt(row.id);
      }
      if (result.reason === "max_attempts") {
        return apiUnauthorized("Too many wrong attempts. Request a new OTP.");
      }
      if (result.reason === "expired") {
        return apiUnauthorized("Code expired. Request a new OTP.");
      }
      return apiUnauthorized("Code expired or invalid. Request a new OTP.");
    }

    await markOtpConsumed(result.rowId);
    const phoneProofToken = await signPhoneRegistrationProof(phoneNorm, result.rowId);

    return apiSuccess({
      phoneVerified: true,
      phone: phoneNorm,
      phoneProofToken,
      message: "Phone verified.",
    });
  }
);
