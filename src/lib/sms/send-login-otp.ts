/**
 * Login OTP SMS via AWS SNS.
 */

import { sendSmsViaSns, isAwsSnsSmsConfigured } from "./sns";

/** Short, transactional-style text. */
export const OTP_MESSAGE_BODY = (code: string) =>
  `Indovyapar OTP ${code}. Valid 10 min. Do not share.`;

export type SendLoginOtpResult = {
  sent: boolean;
  error?: string;
  /** SNS MessageId — CloudWatch / SNS delivery logs. */
  providerRequestId?: string;
};

/** True when AWS SNS credentials and region are set (SMS is expected, not dev fallback). */
export function isSmsProviderConfigured(): boolean {
  return isAwsSnsSmsConfigured();
}

export async function sendLoginOtpSms(e164: string, code: string): Promise<SendLoginOtpResult> {
  const message = OTP_MESSAGE_BODY(code);
  const r = await sendSmsViaSns(e164, message);
  if (r.sent) {
    return { sent: true, providerRequestId: r.messageId };
  }
  if (process.env.NODE_ENV === "development" && !isAwsSnsSmsConfigured()) {
    console.warn(`[SMS OTP] AWS SNS not configured. To: ${e164}  Code: ${code}`);
  } else if (process.env.NODE_ENV === "development" && r.error) {
    console.warn(`[SMS OTP] AWS SNS failed: ${r.error}`);
  }
  return { sent: false, ...(r.error ? { error: r.error } : {}) };
}
