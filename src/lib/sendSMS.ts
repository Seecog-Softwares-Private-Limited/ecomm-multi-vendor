/**
 * Generic transactional SMS (vendor alerts, admin notifications, etc.).
 *
 * Provider: Fast2SMS Quick SMS / bulkV2 by default (`route: q`).
 * Customer login OTP uses this path too (server-generated OTP + `formatCustomerOtpQuickSms`).
 * Optional DLT: set FAST2SMS_OTP_ID and use `sendOtpViaFast2Sms` in `sms.service.ts` only if you migrate that flow.
 *
 * To switch provider later: replace `sendViaFast2SmsBulk()` and keep `sendSMS()` signature.
 *
 * Server-only — never import from client components.
 */

import axios, { isAxiosError } from "axios";
import { normalizeIndianPhone, toIndianMobile10Digits } from "@/lib/auth/phone";

const DEFAULT_BASE_URL = "https://www.fast2sms.com";
const DEFAULT_BULK_PATH = "/dev/bulkV2";
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 800;

/** Max GSM-7 length per segment; keep vendor alerts concise. */
const MAX_MESSAGE_LENGTH = 480;

export type SendSmsResult = { success: true } | { success: false; error: string };

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

/** True when Fast2SMS API key is set (bulk SMS does not need OTP template id). */
export function isSmsProviderConfigured(): boolean {
  return Boolean(trimEnv("FAST2SMS_API_KEY"));
}

function getBulkConfig(): { baseUrl: string; bulkPath: string; apiKey: string; route: string } | null {
  const apiKey = trimEnv("FAST2SMS_API_KEY");
  if (!apiKey) return null;

  const baseUrl = (trimEnv("FAST2SMS_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const bulkPath = trimEnv("FAST2SMS_BULK_PATH") ?? DEFAULT_BULK_PATH;

  return {
    baseUrl,
    bulkPath: bulkPath.startsWith("/") ? bulkPath : `/${bulkPath}`,
    apiKey,
    route: trimEnv("FAST2SMS_BULK_ROUTE") ?? "q",
  };
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

function isFast2SmsSuccess(data: unknown, httpStatus: number): boolean {
  if (httpStatus < 200 || httpStatus >= 300) return false;
  if (data == null) return true;
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (o.return === true) return true;
    if (o.return === false) return false;
    const code = o.status_code;
    if (code === 200 || code === "200") return true;
  }
  return true;
}

function failureMessage(data: unknown, httpStatus: number): string {
  if (data != null && typeof data === "object") {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (Array.isArray(msg) && msg[0]) return String(msg[0]);
  }
  return `SMS failed (HTTP ${httpStatus})`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fast2SMS bulkV2 — POST JSON with `authorization` header.
 * @see https://docs.fast2sms.com/reference/quick-sms
 */
async function sendViaFast2SmsBulk(mobile10: string, message: string): Promise<SendSmsResult> {
  const config = getBulkConfig();
  if (!config) {
    return { success: false, error: "FAST2SMS_API_KEY is not set" };
  }

  const url = `${config.baseUrl}${config.bulkPath}`;
  const body: Record<string, string | number> = {
    route: config.route,
    message,
    language: "english",
    flash: 0,
    numbers: mobile10,
  };

  const senderId = trimEnv("FAST2SMS_SENDER_ID");
  if (senderId && config.route === "d") {
    body.sender_id = senderId;
  }

  let lastError = "Fast2SMS bulk send failed";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, status } = await axios.post<unknown>(url, body, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: config.apiKey,
        },
        timeout: REQUEST_TIMEOUT_MS,
        validateStatus: (s) => s >= 200 && s < 500,
      });

      if (isFast2SmsSuccess(data, status)) {
        return { success: true };
      }
      lastError = failureMessage(data, status);
      console.error("[sendSMS] Fast2SMS non-success response", { status, data });
      break;
    } catch (e) {
      if (isAxiosError(e)) {
        console.error("[sendSMS] Fast2SMS request error", e.response?.data ?? e.message);
        lastError =
          typeof e.response?.data === "object" &&
          e.response.data &&
          "message" in (e.response.data as object)
            ? String((e.response.data as { message: unknown }).message)
            : e.message;
      } else {
        lastError = e instanceof Error ? e.message : String(e);
        console.error("[sendSMS] Fast2SMS error", lastError);
      }
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
    }
  }

  return { success: false, error: lastError };
}

/**
 * Sends one SMS to an Indian mobile number.
 * Does not throw — inspect `success` on the result.
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<SendSmsResult> {
  if (!isSmsProviderConfigured()) {
    console.warn("[sendSMS] Skipped — FAST2SMS_API_KEY not configured");
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

  return sendViaFast2SmsBulk(mobile10, text);
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
