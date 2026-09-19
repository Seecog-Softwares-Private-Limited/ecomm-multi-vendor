/**
 * SMS provider configuration (env-only; never hardcode API keys).
 */

export type SmsProviderName = "blacksms" | "msg91" | "twilio" | "none";

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function getSmsProvider(): SmsProviderName {
  const explicit = trimEnv("SMS_PROVIDER")?.toLowerCase();
  if (explicit === "msg91" || explicit === "twilio" || explicit === "blacksms") {
    return explicit;
  }
  if (trimEnv("BLACKSMS_API_KEY") && trimEnv("BLACKSMS_SENDER_ID")) return "blacksms";
  if (trimEnv("MSG91_AUTH_KEY")) return "msg91";
  if (trimEnv("TWILIO_ACCOUNT_SID") && trimEnv("TWILIO_AUTH_TOKEN")) return "twilio";
  return "none";
}

/** Comma-separated admin alert numbers, e.g. 919876543210,919812345678 */
export function getAdminAlertPhones(): string[] {
  const raw = trimEnv("ADMIN_ALERT_PHONES") ?? trimEnv("ADMIN_SMS_PHONES");
  if (!raw) return [];
  return raw.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);
}
