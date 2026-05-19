/**
 * Customer phone OTP handlers (send / verify).
 * Used by POST /api/auth/send-otp and POST /api/auth/verify-otp route aliases.
 */

import { randomBytes, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiValidationError,
  apiError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validatePhoneOtpSend,
  validatePhoneOtpVerify,
  formatValidationDetails,
  hashPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import {
  normalizeIndianPhone,
  syntheticEmailForPhoneNorm,
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
import { isFast2SmsConfigured, sendOtpViaFast2Sms } from "@/lib/sms/sms.service";
import {
  sendOtp as msg91SendOtp,
  verifyOtp as msg91VerifyOtp,
  isMsg91OtpConfigured,
  PHONE_OTP_MSG91_MARKER,
} from "@/lib/sms/msg91-otp";

export type SendOtpBody = { phone: string };
export type VerifyOtpBody = { phone: string; otp?: string; code?: string };

export type SendOtpSuccess = {
  message: string;
  expiresInSeconds: number;
  smsSent: boolean;
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
  };
};

/**
 * POST /api/auth/send-otp
 * 1. Validate Indian mobile
 * 2. Rate-limit
 * 3. Generate 6-digit OTP, hash & store (5 min expiry)
 * 4. Deliver via Fast2SMS (or MSG91 / dev console fallback)
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

  const rate = await checkOtpSendRateLimit(phoneNorm);
  if (!rate.allowed) {
    if (rate.reason === "cooldown") {
      return apiError(
        "Please wait a minute before requesting another code.",
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
        ? "SMS OTP is not configured. Set FAST2SMS_API_KEY and FAST2SMS_OTP_ID (or MSG91_AUTH_KEY) on the server."
        : "SMS OTP is not configured. Set Fast2SMS env vars, MSG91_AUTH_KEY, or OTP_DEV_CONSOLE=true for local testing.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  await invalidatePendingOtps(phoneNorm);

  if (provider === "fast2sms" || provider === "dev_console") {
    const plainOtp = generateOtpCode();
    await storeOtpHash(phoneNorm, plainOtp);

    if (provider === "dev_console") {
      const tail = phoneNorm.slice(-4);
      console.info(`[phone-otp][DEV] OTP for ***${tail}: ${plainOtp} (expires in ${OTP_EXPIRY_MS / 1000}s)`);
    } else {
      if (!isFast2SmsConfigured()) {
        return apiError(
          "Fast2SMS is not configured correctly.",
          Status.SERVICE_UNAVAILABLE,
          "SMS_NOT_CONFIGURED"
        );
      }
      const sms = await sendOtpViaFast2Sms(phoneNorm, plainOtp);
      if (!sms.success) {
        await invalidatePendingOtps(phoneNorm);
        const message =
          process.env.NODE_ENV === "development" && sms.error
            ? `SMS failed: ${sms.error}`
            : "We could not send the verification code. Try again in a few minutes.";
        return apiError(message, Status.BAD_GATEWAY, "SMS_SEND_FAILED");
      }
    }

    return apiSuccess<SendOtpSuccess>({
      message: "OTP sent successfully",
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      smsSent: provider !== "dev_console",
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

  return apiSuccess<SendOtpSuccess>({
    message: "OTP sent successfully",
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    smsSent: true,
  });
}

/**
 * POST /api/auth/verify-otp
 * 1. Validate phone + 6-digit OTP
 * 2. Verify hash (Fast2SMS / local) or MSG91 API
 * 3. Issue JWT and set auth cookie
 */
export async function handleVerifyCustomerOtp(
  body: unknown
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
  const provider = resolveOtpProvider();

  const row = await findActiveOtpRow(phoneNorm);
  if (!row) {
    return apiUnauthorized("Code expired or invalid. Request a new OTP.");
  }

  if (isMsg91BackedRow(row.codeHash) || provider === "msg91") {
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
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
    },
  });

  if (!user) {
    const email = syntheticEmailForPhoneNorm(phoneNorm);
    const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone: phoneNorm,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
      },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
    user = { ...user, emailVerified: true };
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const payload: VerifyOtpSuccess = {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: "CUSTOMER",
    },
  };

  const response = apiSuccess(payload);
  setAuthCookie(response, token);
  return response;
}

/** Exported for tests / diagnostics. */
export { isDevConsoleOtpAllowed, resolveOtpProvider };
