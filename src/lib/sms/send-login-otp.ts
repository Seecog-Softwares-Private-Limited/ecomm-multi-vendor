/**
 * Login and verification OTP via Brevo transactional SMS.
 */

import { isBrevoSmsConfigured, sendTransactionalSmsBrevo } from "./brevo-sms";

export function otpSmsContent(otp: string): string {
  return `Your OTP is ${otp}`;
}

export type SendLoginOtpResult = {
  sent: boolean;
  error?: string;
  /** Brevo message id when returned by the API. */
  providerRequestId?: string;
};

export function isSmsProviderConfigured(): boolean {
  return isBrevoSmsConfigured();
}

/**
 * @param e164 — e.g. +919876543210 (Indian mobile; normalized upstream)
 * @param code — 6-digit OTP
 */
export async function sendLoginOtpSms(
  e164: string,
  code: string
): Promise<SendLoginOtpResult> {
  const recipient = e164.replace(/^\s*\+/, "");
  const content = otpSmsContent(code);
  const r = await sendTransactionalSmsBrevo(recipient, content);
  if (r.sent) {
    return { sent: true, providerRequestId: r.messageId };
  }
  if (process.env.NODE_ENV === "development" && !isBrevoSmsConfigured()) {
    console.warn(`[SMS OTP] BREVO_API_KEY not set. To: ${e164}  Code: ${code}`);
  } else if (process.env.NODE_ENV === "development" && r.error) {
    console.warn(`[SMS OTP] Brevo failed: ${r.error}`);
  }
  return { sent: false, ...(r.error ? { error: r.error } : {}) };
}
