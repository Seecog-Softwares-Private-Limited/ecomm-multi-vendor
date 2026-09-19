/**
 * Generic transactional SMS (vendor alerts, admin notifications, etc.).
 *
 * Provider: BlackSMS bulk campaign API.
 * Customer login OTP uses `deliverCustomerLoginOtp()` (BlackSMS OTP API).
 *
 * Server-only — never import from client components.
 */

import { normalizeIndianPhone, toIndianMobile10Digits } from "@/lib/auth/phone";
import { isBlackSmsConfigured, sendBlackSmsTransactional } from "@/sms/blacksms.client";

const MAX_MESSAGE_LENGTH = 160;

export type SendSmsResult = { success: true } | { success: false; error: string };

export function isSmsProviderConfigured(): boolean {
  return isBlackSmsConfigured();
}

/**
 * Validates and normalizes an Indian mobile for SMS.
 * Accepts 10-digit or +91 / 91 prefixed numbers.
 */
export function normalizeSmsPhone(phoneNumber: string): string | null {
  const raw = phoneNumber?.trim();
  if (!raw) return null;
  const norm = normalizeIndianPhone(raw);
  if (!norm) return null;
  const mobile10 = toIndianMobile10Digits(norm);
  if (!/^[6-9]\d{9}$/.test(mobile10)) return null;
  return mobile10;
}

function sanitizeMessage(message: string): string {
  return message.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH);
}

/**
 * Sends one SMS to an Indian mobile number.
 * Does not throw — inspect `success` on the result.
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<SendSmsResult> {
  if (!isSmsProviderConfigured()) {
    console.warn("[sendSMS] Skipped — BLACKSMS_API_KEY / BLACKSMS_SENDER_ID not configured");
    return { success: false, error: "SMS provider not configured" };
  }

  const mobile10 = normalizeSmsPhone(phoneNumber);
  if (!mobile10) {
    console.warn("[sendSMS] Skipped — invalid phone number");
    return { success: false, error: "Invalid Indian mobile number" };
  }

  const text = sanitizeMessage(message);
  if (!text) {
    return { success: false, error: "Message is empty" };
  }

  return sendBlackSmsTransactional(mobile10, text);
}

/**
 * Fire-and-forget SMS for admin actions. Failures are logged only; callers must not await for business logic.
 */
export function sendSMSAsync(phoneNumber: string, message: string, logContext: string): void {
  void sendSMS(phoneNumber, message).then((result) => {
    const masked = phoneNumber.replace(/\D/g, "").slice(-4);
    if (result.success) {
      console.info(`[sendSMS] SMS sent successfully (${logContext}) ***${masked}`);
    } else {
      console.error(`[sendSMS] SMS failed (${logContext}) ***${masked}:`, result.error);
    }
  });
}
