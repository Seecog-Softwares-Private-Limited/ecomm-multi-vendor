import { randomInt, randomUUID } from "crypto";
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
import {
  validatePhoneOtpSend,
  formatValidationDetails,
} from "@/lib/auth";
import { normalizeIndianPhone, phoneNormToE164, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { hashPhoneOtp } from "@/lib/auth/phone-otp-hash";
import { sendLoginOtpSms, isSmsProviderConfigured } from "@/lib/sms/send-login-otp";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_EXPIRY_MS = 10 * 60_000;

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

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = hashPhoneOtp(phoneNorm, code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const e164 = phoneNormToE164(phoneNorm);
  const sms = await sendLoginOtpSms(e164, code);
  const providerConfigured = isSmsProviderConfigured();

  if (!sms.sent && providerConfigured) {
    const generic =
      "SMS could not be sent. Check Fast2SMS balance, API key, and FAST2SMS_ROUTE in .env (try q if otp fails). See server logs.";
    const message =
      process.env.NODE_ENV === "development" && sms.error
        ? `SMS failed: ${sms.error}`
        : sms.error
          ? "SMS could not be delivered. Check your SMS provider settings and balance."
          : generic;
    return apiError(message, Status.BAD_GATEWAY, "SMS_SEND_FAILED");
  }

  await prisma.customerPhoneOtp.create({
    data: {
      id: randomUUID(),
      phoneNorm,
      codeHash,
      expiresAt,
    },
  });

  const expiresInSeconds = Math.floor(OTP_EXPIRY_MS / 1000);

  if (!sms.sent && !providerConfigured) {
    const payload = {
      message:
        "No SMS provider configured — use the code below locally only. Add FAST2SMS_API_KEY to .env for real SMS.",
      expiresInSeconds,
      smsSent: false as const,
      devOtp: code,
    };
    return apiSuccess(payload);
  }

  return apiSuccess({
    message: "We sent a verification code to your mobile number.",
    expiresInSeconds,
    smsSent: true as const,
    ...(process.env.NODE_ENV === "development" && sms.providerRequestId
      ? { smsTraceId: sms.providerRequestId }
      : {}),
  });
});
