import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  apiError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { validatePhoneOtpSend, formatValidationDetails } from "@/lib/auth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import {
  sendOtp,
  isMsg91OtpConfigured,
  PHONE_OTP_MSG91_MARKER,
} from "@/lib/sms/msg91-otp";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_WINDOW_MS = 10 * 60_000;

export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validatePhoneOtpSend(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const phoneNorm = normalizeIndianPhone(validation.data.phone);
  if (!phoneNorm) {
    return apiBadRequest(INDIAN_MOBILE_HINT);
  }

  const recent = await prisma.customerPhoneOtp.findFirst({
    where: {
      phoneNorm,
      createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    return apiError(
      "Please wait a minute before requesting another code.",
      Status.TOO_MANY_REQUESTS,
      "TOO_MANY_REQUESTS"
    );
  }

  await prisma.customerPhoneOtp.updateMany({
    where: { phoneNorm, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  if (!isMsg91OtpConfigured()) {
    return apiError(
      process.env.NODE_ENV === "production"
        ? "SMS OTP is not configured on this server. Set MSG91_AUTH_KEY in the process environment and restart the app."
        : "MSG91_AUTH_KEY is not set. Add it to your .env file to send OTP.",
      Status.SERVICE_UNAVAILABLE,
      "SMS_NOT_CONFIGURED"
    );
  }

  const out = await sendOtp(phoneNorm);
  if (!out.success) {
    const message =
      process.env.NODE_ENV === "development" && out.error
        ? `SMS failed: ${out.error}`
        : "We could not send the verification code. Try again in a few minutes.";
    return apiError(message, Status.BAD_GATEWAY, "SMS_SEND_FAILED");
  }

  const expiresAt = new Date(Date.now() + OTP_WINDOW_MS);
  await prisma.customerPhoneOtp.create({
    data: {
      id: randomUUID(),
      phoneNorm,
      codeHash: PHONE_OTP_MSG91_MARKER,
      expiresAt,
      attemptCount: 0,
    },
  });

  if (process.env.NODE_ENV === "development") {
    const tail = phoneNorm.length >= 4 ? phoneNorm.slice(-4) : "****";
    console.info(`[phone-otp] MSG91 send OTP sent for ***${tail} (verify via MSG91)`);
  }

  return apiSuccess({
    message: "We sent a verification code to your mobile number.",
    expiresInSeconds: Math.floor(OTP_WINDOW_MS / 1000),
    smsSent: true as const,
  });
});
