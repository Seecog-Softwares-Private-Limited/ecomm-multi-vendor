/**
 * Customer phone OTP handlers (send / verify).
 * Used by POST /api/auth/send-otp and POST /api/auth/verify-otp route aliases.
 *
 * Customer OTP: server-generated 6-digit code, HMAC in DB, 5-minute expiry.
 * SMS delivery uses BlackSMS OTP API (`POST https://blacksms.in/sms`).
 */

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiValidationError,
  apiError,
  apiConflict,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validatePhoneOtpSend,
  validatePhoneOtpVerify,
  formatValidationDetails,
  signToken,
  setAuthCookie,
  getSession,
} from "@/lib/auth";
import {
  normalizeIndianPhone,
  placeholderEmailForPhoneNorm,
  INDIAN_MOBILE_HINT,
} from "@/lib/auth/phone";
import {
  checkOtpSendRateLimit,
  generateOtpCode,
  invalidatePendingOtps,
  storeOtpHash,
  findActiveOtpRow,
  verifyStoredOtp,
  markOtpConsumed,
  incrementOtpAttempt,
  isMsg91BackedRow,
  resolveOtpProvider,
  OTP_EXPIRY_MS,
  isSixDigitOtp,
  isDevConsoleOtpAllowed,
} from "@/lib/auth/otp.service";
import { isSmsProviderConfigured } from "@/lib/sendSMS";
import { deliverCustomerLoginOtp } from "@/sms/otp-delivery";
import {
  sendOtp as msg91SendOtp,
  verifyOtp as msg91VerifyOtp,
  isMsg91OtpConfigured,
  PHONE_OTP_MSG91_MARKER,
} from "@/lib/sms/msg91-otp";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";

export type SendOtpBody = { phone: string };
export type VerifyOtpBody = { phone: string; otp?: string; code?: string };

export type SendOtpSuccess = {
  message: string;
  expiresInSeconds: number;
  smsSent: boolean;
  /** True when client sent `resend: true` (same rate limits apply). */
  resent?: boolean;
};

export type VerifyOtpSuccess = {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: "CUSTOMER";
    phoneVerified: boolean;
    profileCompleted: boolean;
    authOnboardingComplete: boolean;
    needsProfileCompletion: boolean;
    needsAuthOnboarding: boolean;
  };
};

/**
 * POST /api/auth/send-otp
 * 1. Validate Indian mobile
 * 2. Rate-limit (resend uses same limits — cooldown + hourly cap)
 * 3. Generate 6-digit OTP, hash & store (5 min expiry)
 * 4. Deliver via BlackSMS (or MSG91 / dev console fallback)
 */
export async function handleSendCustomerOtp(
  body: unknown
): Promise<NextResponse> {
  const validation = validatePhoneOtpSend(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const phoneNorm = normalizeIndianPhone(validation.data.phone);
  if (!phoneNorm) {
    return apiBadRequest(INDIAN_MOBILE_HINT);
  }

  const isResend = validation.data.resend === true;

  const rate = await checkOtpSendRateLimit(phoneNorm);
  if (!rate.allowed) {
    if (rate.reason === "cooldown") {
      return apiError(
        isResend
          ? "Please wait before requesting another code."
          : "Please wait a minute before requesting another code.",
        Status.TOO_MANY_REQUESTS,
        "TOO_MANY_REQUESTS",
        { retryAfterSeconds: rate.retryAfterSeconds }
      );
    }
    return apiError(
      "Too many OTP requests for this number. Try again later.",
      Status.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS"
    );
  }

  const provider = resolveOtpProvider();
  if (!provider) {
    return apiError(
      process.env.NODE_ENV === "production"
        ? "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID (or MSG91_AUTH_KEY) on the server."
        : "SMS OTP is not configured. Set BLACKSMS_API_KEY and BLACKSMS_SENDER_ID, MSG91_AUTH_KEY, or OTP_DEV_CONSOLE=true for local testing.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  await invalidatePendingOtps(phoneNorm);

  if (provider === "blacksms" || provider === "dev_console") {
    const plainOtp = generateOtpCode();
    await storeOtpHash(phoneNorm, plainOtp);

    if (provider === "dev_console") {
      const tail = phoneNorm.slice(-4);
      console.info(`[phone-otp][DEV] OTP for ***${tail}: ${plainOtp} (expires in ${OTP_EXPIRY_MS / 1000}s)`);
    } else {
      if (!isSmsProviderConfigured()) {
        await invalidatePendingOtps(phoneNorm);
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
        console.error("[phone-otp] Unexpected error while sending Quick SMS", e);
        await invalidatePendingOtps(phoneNorm);
        return apiError(
          process.env.NODE_ENV === "development"
            ? `SMS failed: ${e instanceof Error ? e.message : String(e)}`
            : "We could not send the verification code. Try again in a few minutes.",
          Status.BAD_GATEWAY,
          "SMS_SEND_FAILED"
        );
      }

      if (!sms.success) {
        await invalidatePendingOtps(phoneNorm);
        const userMessage =
          process.env.NODE_ENV === "development" && sms.error
            ? `SMS failed: ${sms.error}`
            : "We could not send the verification code. Try again in a few minutes.";
        console.error("[phone-otp] BlackSMS OTP send failed:", sms.error);
        return apiError(userMessage, Status.BAD_GATEWAY, "SMS_SEND_FAILED");
      }

      console.info(`[phone-otp] Quick SMS sent successfully for ***${phoneNorm.slice(-4)}`);
    }

    return apiSuccess<SendOtpSuccess>({
      message: isResend
        ? "A new verification code has been sent to your mobile number."
        : "OTP sent successfully",
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      smsSent: provider !== "dev_console",
      ...(isResend ? { resent: true } : {}),
    });
  }

  // MSG91: provider generates OTP; we only track session window in DB
  if (!isMsg91OtpConfigured()) {
    return apiError(
      "MSG91_AUTH_KEY is not set.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  const out = await msg91SendOtp(phoneNorm);
  if (!out.success) {
    const message =
      process.env.NODE_ENV === "development" && out.error
        ? `SMS failed: ${out.error}`
        : "We could not send the verification code. Try again in a few minutes.";
    console.error("[phone-otp] MSG91 send failed:", out.error);
    return apiError(message, Status.BAD_GATEWAY, "SMS_SEND_FAILED");
  }

  await prisma.customerPhoneOtp.create({
    data: {
      id: randomUUID(),
      phoneNorm,
      codeHash: PHONE_OTP_MSG91_MARKER,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      attemptCount: 0,
    },
  });

  console.info(`[phone-otp] MSG91 OTP triggered for ***${phoneNorm.slice(-4)}`);

  return apiSuccess<SendOtpSuccess>({
    message: isResend
      ? "A new verification code has been sent to your mobile number."
      : "OTP sent successfully",
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    smsSent: true,
    ...(isResend ? { resent: true } : {}),
  });
}

type CustomerAuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  profileCompleted: boolean;
  authOnboardingComplete: boolean;
};

async function loadCustomerAuthUser(id: string): Promise<CustomerAuthUser | null> {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: CUSTOMER_ONBOARDING_SELECT,
  });
}

/**
 * POST /api/auth/verify-otp
 * 1. Validate phone + OTP
 * 2. Verify against MSG91 if row is MSG91-backed; else local HMAC
 * 3. Resolve User by phone (or attach to logged-in Google/email user without phone)
 * 4. Issue JWT — account may still be incomplete (authOnboardingComplete=false)
 */
export async function handleVerifyCustomerOtp(
  body: unknown,
  request?: NextRequest
): Promise<NextResponse> {
  const validation = validatePhoneOtpVerify(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const phoneNorm = normalizeIndianPhone(validation.data.phone);
  if (!phoneNorm) {
    return apiBadRequest(INDIAN_MOBILE_HINT);
  }

  const code = validation.data.code.trim();

  const row = await findActiveOtpRow(phoneNorm);
  if (!row) {
    return apiUnauthorized("Code expired or invalid. Request a new OTP.");
  }

  if (isMsg91BackedRow(row.codeHash)) {
    if (row.attemptCount >= 5) {
      return apiUnauthorized("Too many wrong attempts. Request a new OTP.");
    }
    const v = await msg91VerifyOtp(phoneNorm, code);
    if (!v.success) {
      await incrementOtpAttempt(row.id);
      return apiUnauthorized("Incorrect code. Try again.");
    }
    await markOtpConsumed(row.id);
  } else {
    if (!isSixDigitOtp(code)) {
      return apiBadRequest("Enter the 6-digit OTP from your SMS.");
    }
    const check = verifyStoredOtp(row, code);
    if (!check.valid) {
      if (check.reason === "wrong_code") {
        await incrementOtpAttempt(row.id);
        return apiUnauthorized("Incorrect code. Try again.");
      }
      if (check.reason === "max_attempts") {
        return apiUnauthorized("Too many wrong attempts. Request a new OTP.");
      }
      if (check.reason === "expired") {
        return apiUnauthorized("Code expired. Request a new OTP.");
      }
      return apiUnauthorized("Code expired or invalid. Request a new OTP.");
    }
    await markOtpConsumed(check.rowId);
  }

  let user = await prisma.user.findFirst({
    where: { phone: phoneNorm, deletedAt: null },
    select: CUSTOMER_ONBOARDING_SELECT,
  });

  const session = request ? await getSession(request) : null;

  if (user) {
    // Logged-in customer must not silently take over / merge into another phone account.
    if (session?.role === "CUSTOMER" && session.sub !== user.id) {
      return apiConflict(
        "This phone number is already registered with another account. Please log in to that account."
      );
    }

    // Returning / email-register / Google (phone already saved) — never auto-verify email.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        // Keep legacy profileCompleted in sync when a verified phone is present.
        profileCompleted: true,
      },
    });
    await syncCustomerAuthOnboardingComplete(user.id);
    user = await loadCustomerAuthUser(user.id);
  } else {
    // Phone not on any account: attach to logged-in customer without a verified phone
    // (Google-first), otherwise create a new incomplete phone-first user.
    if (session?.role === "CUSTOMER") {
      const sessionUser = await prisma.user.findFirst({
        where: { id: session.sub, deletedAt: null },
        select: {
          id: true,
          phone: true,
          phoneVerified: true,
        },
      });

      if (sessionUser) {
        if (sessionUser.phoneVerified && sessionUser.phone && sessionUser.phone !== phoneNorm) {
          return apiConflict(
            "Your verified phone cannot be changed here. Please log in with your existing number."
          );
        }

        // Attach when no phone, or replace an unverified draft phone from complete-details.
        if (!sessionUser.phone || !sessionUser.phoneVerified) {
          try {
            await prisma.user.update({
              where: { id: sessionUser.id },
              data: {
                phone: phoneNorm,
                phoneVerified: true,
                profileCompleted: true,
              },
            });
          } catch (e: unknown) {
            const errCode =
              e && typeof e === "object" && "code" in e
                ? String((e as { code: unknown }).code)
                : "";
            if (errCode === "P2002") {
              return apiConflict(
                "This phone number is already registered with another account. Please log in to that account."
              );
            }
            throw e;
          }
          await syncCustomerAuthOnboardingComplete(sessionUser.id);
          user = await loadCustomerAuthUser(sessionUser.id);
        }
      }
    }

    if (!user) {
      const email = placeholderEmailForPhoneNorm(phoneNorm);
      try {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: null,
            phone: phoneNorm,
            phoneVerified: true,
            emailVerified: false,
            profileCompleted: false,
            authOnboardingComplete: false,
          },
          select: CUSTOMER_ONBOARDING_SELECT,
        });
      } catch (e: unknown) {
        const errCode =
          e && typeof e === "object" && "code" in e
            ? String((e as { code: unknown }).code)
            : "";
        if (errCode === "P2002") {
          // Race: phone or placeholder email taken — resolve by phone again.
          user = await prisma.user.findFirst({
            where: { phone: phoneNorm, deletedAt: null },
            select: CUSTOMER_ONBOARDING_SELECT,
          });
          if (!user) {
            return apiConflict(
              "Could not create account for this phone number. Please try again."
            );
          }
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: true },
          });
          await syncCustomerAuthOnboardingComplete(user.id);
          user = await loadCustomerAuthUser(user.id);
        } else {
          throw e;
        }
      }
    }
  }

  if (!user) {
    return apiError("Could not sign you in. Please try again.", Status.INTERNAL_SERVER_ERROR);
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const status = customerAuthStatusFields(user);
  const payload: VerifyOtpSuccess = {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: "CUSTOMER",
      ...status,
    },
  };

  const response = apiSuccess(payload);
  setAuthCookie(response, token);
  return response;
}

/** Exported for tests / diagnostics. */
export { isDevConsoleOtpAllowed, resolveOtpProvider };
