/**
 * MSG91 SendOTP: OTP is generated and verified by MSG91 (not stored in our DB).
 * @see https://docs.msg91.com/ — SendOTP / verify OTP
 */

import axios, { isAxiosError } from "axios";

const MSG91_OTP_URL = "https://api.msg91.com/api/v5/otp";
const MSG91_VERIFY_URL = "https://api.msg91.com/api/v5/otp/verify";

/** DLT/OTP template from MSG91 dashboard. */
const DEFAULT_TEMPLATE_ID = "69eaf32921c771359c0a52f2";

function templateId(): string {
  return process.env.MSG91_TEMPLATE_ID?.trim() || DEFAULT_TEMPLATE_ID;
}

function authKey(): string | undefined {
  return process.env.MSG91_AUTH_KEY?.trim();
}

/**
 * 10-digit Indian number → international without +
 * (Caller passes normalized e.g. 9198xxxxxxxx from normalizeIndianPhone).
 */
function mobileParam(phoneNorm: string): string {
  const d = phoneNorm.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("0") === false) {
    return `91${d}`;
  }
  if (d.startsWith("91") && d.length === 12) {
    return d;
  }
  return d;
}

function logMsg91Error(context: string, e: unknown): string {
  if (isAxiosError(e)) {
    const detail = e.response?.data ?? e.message;
    console.error(`[MSG91 ${context}]`, detail);
    if (e.response?.data && typeof e.response.data === "object" && e.response.data !== null) {
      const m = (e.response.data as { message?: string }).message;
      if (typeof m === "string") return m;
    }
    return e.message;
  }
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[MSG91 ${context}]`, msg);
  return msg;
}

function isMsg91SuccessResponse(data: unknown): boolean {
  if (data == null || typeof data !== "object") return false;
  const t = (data as { type?: string }).type;
  return typeof t === "string" && t.toLowerCase() === "success";
}

function failureMessageFromBody(data: unknown): string {
  if (data != null && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return "MSG91 request failed";
}

export function isMsg91OtpConfigured(): boolean {
  return Boolean(authKey());
}

export type Msg91OtpResult = { success: true } | { success: false; error: string };

/**
 * Triggers SendOTP; MSG91 generates the OTP and sends the SMS.
 * @param phoneNorm — e.g. 9198xxxxxxxx (from `normalizeIndianPhone`)
 */
export async function sendOtp(phone: string): Promise<Msg91OtpResult> {
  const key = authKey();
  if (!key) {
    return { success: false, error: "MSG91_AUTH_KEY is not set" };
  }
  const mobile = mobileParam(phone);
  try {
    const { data } = await axios.get(MSG91_OTP_URL, {
      params: {
        template_id: templateId(),
        mobile,
        authkey: key,
      },
      timeout: 25_000,
    });
    if (isMsg91SuccessResponse(data)) {
      return { success: true };
    }
    const err = failureMessageFromBody(data);
    console.error("[MSG91 sendOtp] Non-success", data);
    return { success: false, error: err };
  } catch (e) {
    const msg = logMsg91Error("sendOtp", e);
    return { success: false, error: msg };
  }
}

/**
 * Verifies the OTP with MSG91 (not against local DB).
 * @param phoneNorm — e.g. 9198xxxxxxxx
 */
export async function verifyOtp(phone: string, otp: string): Promise<Msg91OtpResult> {
  const key = authKey();
  if (!key) {
    return { success: false, error: "MSG91_AUTH_KEY is not set" };
  }
  const mobile = mobileParam(phone);
  const code = otp.trim();
  if (!/^\d{4,9}$/.test(code)) {
    return { success: false, error: "Invalid OTP format" };
  }
  try {
    const { data } = await axios.get(MSG91_VERIFY_URL, {
      params: {
        mobile,
        otp: code,
        authkey: key,
      },
      timeout: 25_000,
    });
    if (isMsg91SuccessResponse(data)) {
      return { success: true };
    }
    const err = failureMessageFromBody(data);
    console.error("[MSG91 verifyOtp] Non-success", data);
    return { success: false, error: err };
  } catch (e) {
    const msg = logMsg91Error("verifyOtp", e);
    return { success: false, error: msg };
  }
}

/** Stored in DB only as a marker that MSG91 holds the real OTP (not a hash of the code). */
export const PHONE_OTP_MSG91_MARKER = "__msg91_sendotp__";
