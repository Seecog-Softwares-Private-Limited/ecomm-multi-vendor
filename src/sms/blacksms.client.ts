/**
 * BlackSMS HTTP client (server-only).
 * Official docs: https://docs.blacksms.in/
 *
 * OTP: POST https://blacksms.in/sms
 * Transactional: POST https://blacksms.in/endpoints/v1/bulk-sms
 *
 * App generates/verifies OTP; BlackSMS only delivers the SMS.
 */

import axios, { isAxiosError } from "axios";

const DEFAULT_BASE_URL = "https://blacksms.in";
const OTP_PATH = "/sms";
const BULK_PATH = "/endpoints/v1/bulk-sms";
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 800;

export type BlackSmsResult = { success: true } | { success: false; error: string };

export type BlackSmsEnv = {
  apiKey: string;
  senderId: string;
  baseUrl: string;
  /** OTP route 1–9; omitted when unset so the provider default (1) applies. */
  otpRoute: number | null;
};

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function maskIndianMobile(mobile10: string): string {
  const d = mobile10.replace(/\D/g, "");
  if (d.length < 4) return "****";
  return `${d.slice(0, 2)}${"*".repeat(Math.max(4, d.length - 4))}${d.slice(-2)}`;
}

export function getBlackSmsEnv(): BlackSmsEnv | null {
  const apiKey = trimEnv("BLACKSMS_API_KEY");
  const senderId = trimEnv("BLACKSMS_SENDER_ID");
  if (!apiKey || !senderId) return null;

  const baseUrl = (trimEnv("BLACKSMS_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const routeRaw = trimEnv("BLACKSMS_OTP_ROUTE");
  let otpRoute: number | null = null;
  if (routeRaw) {
    const n = Number.parseInt(routeRaw, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 9) otpRoute = n;
  }

  return { apiKey, senderId, baseUrl, otpRoute };
}

export function isBlackSmsConfigured(): boolean {
  return getBlackSmsEnv() != null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function publicErrorMessage(data: unknown, httpStatus: number, fallback: string): string {
  if (data != null && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim().slice(0, 200);
  }
  if (httpStatus >= 400) return `${fallback} (HTTP ${httpStatus})`;
  return fallback;
}

function logSafeFailure(context: string, mobile10: string, status: number, data: unknown): void {
  const masked = maskIndianMobile(mobile10);
  const message =
    data != null && typeof data === "object" && "message" in data
      ? String((data as { message: unknown }).message ?? "")
      : "";
  console.error(`[BlackSMS ${context}]`, { status, message: message.slice(0, 200), mobile: masked });
}

export function isBlackSmsOtpSuccess(data: unknown, httpStatus: number): boolean {
  if (httpStatus < 200 || httpStatus >= 300) return false;
  if (data != null && typeof data === "object") {
    const status = (data as { status?: unknown }).status;
    if (status === 0 || status === "0") return false;
    if (status === 1 || status === "1") return true;
  }
  return httpStatus >= 200 && httpStatus < 300;
}

export function isBlackSmsBulkSuccess(data: unknown, httpStatus: number): boolean {
  if (httpStatus < 200 || httpStatus >= 300) return false;
  if (data != null && typeof data === "object") {
    const o = data as { success?: unknown; status?: unknown };
    if (o.success === false) return false;
    if (o.success === true) return true;
    if (o.status === 0 || o.status === "0") return false;
    if (o.status === 1 || o.status === "1") return true;
  }
  return httpStatus >= 200 && httpStatus < 300;
}

async function postJson(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  context: string,
  mobile10: string,
  isOk: (data: unknown, status: number) => boolean
): Promise<BlackSmsResult> {
  let lastError = "BlackSMS request failed";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, status } = await axios.post<unknown>(url, body, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: REQUEST_TIMEOUT_MS,
        validateStatus: (s) => s >= 200 && s < 500,
      });

      if (isOk(data, status)) {
        console.info(`[BlackSMS ${context}] request sent through BlackSMS ${maskIndianMobile(mobile10)}`);
        return { success: true };
      }

      lastError = publicErrorMessage(data, status, "BlackSMS request failed");
      logSafeFailure(context, mobile10, status, data);
      break;
    } catch (e) {
      lastError = isAxiosError(e)
        ? publicErrorMessage(e.response?.data, e.response?.status ?? 0, e.message)
        : e instanceof Error
          ? e.message
          : String(e);
      console.error(`[BlackSMS ${context}]`, lastError, maskIndianMobile(mobile10));
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
    }
  }

  return { success: false, error: lastError };
}

/**
 * Send OTP via BlackSMS OTP API. `variables_values` is the app-generated OTP (4–6 digits).
 */
export async function sendBlackSmsOtp(mobile10: string, otp: string): Promise<BlackSmsResult> {
  const cfg = getBlackSmsEnv();
  if (!cfg) {
    return { success: false, error: "BLACKSMS_API_KEY or BLACKSMS_SENDER_ID is not set" };
  }
  if (!/^[6-9]\d{9}$/.test(mobile10)) {
    return { success: false, error: "Invalid Indian mobile number" };
  }
  if (!/^\d{4,6}$/.test(otp)) {
    return { success: false, error: "Invalid OTP format" };
  }

  const body: Record<string, unknown> = {
    sender_id: cfg.senderId,
    variables_values: otp,
    numbers: mobile10,
  };
  if (cfg.otpRoute != null) body.route = cfg.otpRoute;

  return postJson(
    `${cfg.baseUrl}${OTP_PATH}`,
    cfg.apiKey,
    body,
    "sendOtp",
    mobile10,
    isBlackSmsOtpSuccess
  );
}

/** Transactional / alert SMS via documented bulk campaign API. */
export async function sendBlackSmsTransactional(
  mobile10: string,
  message: string
): Promise<BlackSmsResult> {
  const cfg = getBlackSmsEnv();
  if (!cfg) {
    return { success: false, error: "BLACKSMS_API_KEY or BLACKSMS_SENDER_ID is not set" };
  }
  if (!/^[6-9]\d{9}$/.test(mobile10)) {
    return { success: false, error: "Invalid Indian mobile number" };
  }
  const text = message.replace(/\s+/g, " ").trim().slice(0, 160);
  if (!text) return { success: false, error: "Message is empty" };

  const body = {
    title: "IndoVyapar",
    message: text,
    contacts: [mobile10],
  };

  return postJson(
    `${cfg.baseUrl}${BULK_PATH}`,
    cfg.apiKey,
    body,
    "sendTransactional",
    mobile10,
    isBlackSmsBulkSuccess
  );
}
