/**
 * Fast2SMS HTTP client for customer OTP delivery.
 *
 * Uses the official OTP API with a server-generated code (stored hashed in our DB).
 * @see https://docs.fast2sms.com/reference/send-otp
 *
 * Configure via FAST2SMS_* env vars. To change URL, headers, or body shape,
 * update `buildFast2SmsOtpRequest()` below.
 */

import axios, { isAxiosError, type AxiosRequestConfig } from "axios";

/** Kept in sync with `otp.service.ts` (5 minutes, 6 digits). */
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60_000;

const DEFAULT_BASE_URL = "https://www.fast2sms.com";
const DEFAULT_OTP_SEND_PATH = "/dev/otp/send";
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

export type SmsSendResult = { success: true } | { success: false; error: string };

export type Fast2SmsConfig = {
  baseUrl: string;
  otpSendPath: string;
  apiKey: string;
  otpTemplateId: string;
  /** DLT {#var#} values pipe-separated; defaults to the OTP digits when unset. */
  variablesValues?: string;
};

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

/** Fast2SMS is ready when API key and OTP template id are set. */
export function isFast2SmsConfigured(): boolean {
  return Boolean(trimEnv("FAST2SMS_API_KEY") && trimEnv("FAST2SMS_OTP_ID"));
}

export function getFast2SmsConfig(): Fast2SmsConfig | null {
  const apiKey = trimEnv("FAST2SMS_API_KEY");
  const otpTemplateId = trimEnv("FAST2SMS_OTP_ID");
  if (!apiKey || !otpTemplateId) return null;

  const baseUrl = (trimEnv("FAST2SMS_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const otpSendPath = trimEnv("FAST2SMS_SEND_PATH") ?? DEFAULT_OTP_SEND_PATH;

  return {
    baseUrl,
    otpSendPath: otpSendPath.startsWith("/") ? otpSendPath : `/${otpSendPath}`,
    apiKey,
    otpTemplateId,
    variablesValues: trimEnv("FAST2SMS_VARIABLES_VALUES"),
  };
}

/**
 * Human-readable OTP text (for logs / dev console). Fast2SMS DLT template carries the SMS body.
 */
export function formatOtpSmsMessage(otp: string): string {
  return `Your IndoVyapar OTP is ${otp}. Do not share this OTP with anyone.`;
}

/** 10-digit Indian mobile from normalized `919876543210`. */
export function formatMobile10(phoneNorm: string): string {
  const digits = phoneNorm.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return digits.slice(2);
  }
  if (digits.length === 10) return digits;
  return digits;
}

function otpExpiryMinutes(): number {
  const fromEnv = trimEnv("FAST2SMS_OTP_EXPIRY_MINUTES");
  if (fromEnv) {
    const n = Number.parseInt(fromEnv, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 10080) return n;
  }
  return Math.max(1, Math.ceil(OTP_EXPIRY_MS / 60_000));
}

/**
 * Builds POST /dev/otp/send — authorization header + JSON body.
 * Passes our OTP so verification stays in our database.
 */
function buildFast2SmsOtpRequest(
  config: Fast2SmsConfig,
  mobile10: string,
  plainOtp: string
): AxiosRequestConfig {
  const url = `${config.baseUrl}${config.otpSendPath}`;

  const body: Record<string, string | number> = {
    mobile: mobile10,
    otp_id: config.otpTemplateId,
    otp: plainOtp,
    otp_length: OTP_LENGTH,
    otp_expiry: otpExpiryMinutes(),
  };

  const variables =
    config.variablesValues?.replace(/\{otp\}/g, plainOtp) ?? plainOtp;
  if (variables) {
    body.variables_values = variables;
  }

  return {
    method: "POST",
    url,
    data: body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: config.apiKey,
    },
    timeout: REQUEST_TIMEOUT_MS,
    validateStatus: (s) => s >= 200 && s < 500,
  };
}

function isFast2SmsSuccessResponse(data: unknown, status: number): boolean {
  if (status < 200 || status >= 300) return false;
  if (data == null) return true;
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (o.return === true) return true;
    if (o.return === false) return false;
    const code = o.status_code;
    if (code === 200 || code === "200") return true;
    if (typeof code === "number" && code >= 400) return false;
  }
  return status >= 200 && status < 300;
}

function failureMessageFromBody(data: unknown, status: number): string {
  if (data != null && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const msg = o.message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return `Fast2SMS request failed (HTTP ${status})`;
}

function logFast2SmsError(context: string, e: unknown): string {
  if (isAxiosError(e)) {
    const detail = e.response?.data ?? e.message;
    console.error(`[Fast2SMS ${context}]`, detail);
    if (e.response?.data && typeof e.response.data === "object" && e.response.data !== null) {
      const m = (e.response.data as { message?: string }).message;
      if (typeof m === "string") return m;
    }
    return e.message;
  }
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[Fast2SMS ${context}]`, msg);
  return msg;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(e: unknown): boolean {
  if (!isAxiosError(e)) return false;
  if (e.code === "ECONNABORTED" || e.code === "ETIMEDOUT") return true;
  const status = e.response?.status;
  return status === 429 || status === 502 || status === 503 || status === 504;
}

/**
 * Sends OTP SMS via Fast2SMS (DLT template + custom OTP value).
 */
export async function sendOtpViaFast2Sms(
  phoneNorm: string,
  plainOtp: string
): Promise<SmsSendResult> {
  const config = getFast2SmsConfig();
  if (!config) {
    return {
      success: false,
      error: "FAST2SMS_API_KEY or FAST2SMS_OTP_ID is not set",
    };
  }

  const mobile10 = formatMobile10(phoneNorm);
  if (!/^[6-9]\d{9}$/.test(mobile10)) {
    return { success: false, error: "Invalid Indian mobile number for SMS" };
  }

  if (!/^\d{4,10}$/.test(plainOtp)) {
    return { success: false, error: "Invalid OTP format for Fast2SMS" };
  }

  const requestConfig = buildFast2SmsOtpRequest(config, mobile10, plainOtp);
  let lastError = "Fast2SMS send failed";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, status } = await axios.request<unknown>(requestConfig);
      if (isFast2SmsSuccessResponse(data, status)) {
        return { success: true };
      }
      lastError = failureMessageFromBody(data, status);
      console.error("[Fast2SMS sendOtp] Non-success", { status, data });
      break;
    } catch (e) {
      lastError = logFast2SmsError("sendOtp", e);
      if (attempt < MAX_RETRIES && isRetryableError(e)) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      break;
    }
  }

  return { success: false, error: lastError };
}
