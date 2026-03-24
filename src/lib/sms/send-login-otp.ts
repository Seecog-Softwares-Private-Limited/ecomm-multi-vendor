/**
 * Login OTP SMS: Fast2SMS (India) first, then Twilio, else dev fallback.
 */

import { sendLoginOtpFast2sms } from "./fast2sms";

/** Short, transactional-style text — long “login code” copy is more likely to be filtered on Quick SMS. */
export const OTP_MESSAGE_BODY = (code: string) =>
  `Indovyapar OTP ${code}. Valid 10 min. Do not share.`;

export type SendLoginOtpResult = {
  sent: boolean;
  error?: string;
  /** Fast2SMS request_id or Twilio SID — for provider dashboards / support. */
  providerRequestId?: string;
};

/** True when Fast2SMS or Twilio env is set (SMS is expected, not dev fallback). */
export function isSmsProviderConfigured(): boolean {
  const fast2 =
    Boolean(process.env.FAST2SMS_API_KEY?.trim()) ||
    Boolean(process.env.FAST2SMS_AUTHORIZATION?.trim());
  const twilio =
    Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()) &&
    Boolean(process.env.TWILIO_PHONE_NUMBER?.trim());
  return fast2 || twilio;
}

async function sendViaTwilio(e164: string, message: string): Promise<SendLoginOtpResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (!sid || !token || !from) {
    return { sent: false };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({
    To: e164,
    From: from,
    Body: message,
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { sent: false, error: text.slice(0, 200) || `Twilio HTTP ${res.status}` };
    }
    const json = (await res.json().catch(() => null)) as { sid?: string } | null;
    return { sent: true, providerRequestId: typeof json?.sid === "string" ? json.sid : undefined };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SMS request failed";
    return { sent: false, error: msg };
  }
}

export async function sendLoginOtpSms(e164: string, code: string): Promise<SendLoginOtpResult> {
  const message = OTP_MESSAGE_BODY(code);
  let lastError: string | undefined;

  if (
    process.env.FAST2SMS_API_KEY?.trim() ||
    process.env.FAST2SMS_AUTHORIZATION?.trim()
  ) {
    const r = await sendLoginOtpFast2sms(e164, code, message);
    if (r.sent) {
      return {
        sent: true,
        providerRequestId: r.requestId,
      };
    }
    lastError = r.error;
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SMS OTP] Fast2SMS failed: ${r.error ?? "unknown"}`);
    }
  }

  const tw = await sendViaTwilio(e164, message);
  if (tw.sent) return tw;
  if (tw.error) {
    lastError = lastError ? `${lastError} | Twilio: ${tw.error}` : tw.error;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[SMS OTP] No working SMS provider. To: ${e164}  Code: ${code}`);
  }

  return { sent: false, ...(lastError ? { error: lastError } : {}) };
}
