/**
 * SMS provider configuration (env-only; never hardcode API keys).
 */

export type SmsProviderName = "fast2sms" | "msg91" | "twilio" | "none";

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function getSmsProvider(): SmsProviderName {
  const explicit = trimEnv("SMS_PROVIDER")?.toLowerCase();
  if (explicit === "msg91" || explicit === "twilio" || explicit === "fast2sms") {
    return explicit;
  }
  if (trimEnv("FAST2SMS_API_KEY")) return "fast2sms";
  if (trimEnv("MSG91_AUTH_KEY")) return "msg91";
  if (trimEnv("TWILIO_ACCOUNT_SID") && trimEnv("TWILIO_AUTH_TOKEN")) return "twilio";
  return "none";
}

export type Fast2SmsEnv = {
  apiKey: string;
  senderId: string;
  /** bulkV2 route: `q` = Quick SMS (no DLT). Use `dlt` only after DLT registration. */
  bulkRoute: string;
  /** OTP: `q` = plain SMS with OTP text (no DLT). Use `otp` only with approved DLT template. */
  otpRoute: string;
  baseUrl: string;
  bulkPath: string;
};

export function getFast2SmsEnv(): Fast2SmsEnv | null {
  const apiKey = trimEnv("FAST2SMS_API_KEY");
  if (!apiKey) return null;
  const baseUrl = (trimEnv("FAST2SMS_BASE_URL") ?? "https://www.fast2sms.com").replace(/\/$/, "");
  const bulkPath = trimEnv("FAST2SMS_BULK_PATH") ?? "/dev/bulkV2";
  // Default Quick SMS — works without DLT registration on Fast2SMS.
  const bulkRoute = trimEnv("FAST2SMS_BULK_ROUTE") ?? trimEnv("FAST2SMS_DLT_ROUTE") ?? "q";
  const otpRoute = trimEnv("FAST2SMS_OTP_ROUTE") ?? "q";
  return {
    apiKey,
    senderId: trimEnv("FAST2SMS_SENDER_ID") ?? "INDOVY",
    bulkRoute,
    otpRoute,
    baseUrl,
    bulkPath: bulkPath.startsWith("/") ? bulkPath : `/${bulkPath}`,
  };
}

/** True when explicitly using DLT routes (requires registered templates). */
export function isFast2SmsDltEnabled(): boolean {
  const cfg = getFast2SmsEnv();
  if (!cfg) return false;
  return cfg.bulkRoute === "dlt" || cfg.otpRoute === "otp";
}

/** Comma-separated admin alert numbers, e.g. 919876543210,919812345678 */
export function getAdminAlertPhones(): string[] {
  const raw = trimEnv("ADMIN_ALERT_PHONES") ?? trimEnv("ADMIN_SMS_PHONES");
  if (!raw) return [];
  return raw.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);
}
