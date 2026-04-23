/**
 * Transactional SMS via Brevo HTTP API.
 * @see https://developers.brevo.com/reference/sendtransacsms
 */

import axios, { isAxiosError } from "axios";

const BREVO_TRANSACTIONAL_SMS_URL =
  "https://api.brevo.com/v3/transactionalSMS/sms";

const DEFAULT_SENDER = "INDOVY";

export type BrevoSmsResult = {
  sent: boolean;
  error?: string;
  messageId?: string;
};

export function isBrevoSmsConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

/**
 * @param recipientDigits — country + national number, no + (e.g. 919876543210)
 * @param content — SMS body (UTF-8)
 */
export async function sendTransactionalSmsBrevo(
  recipientDigits: string,
  content: string
): Promise<BrevoSmsResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false };
  }

  try {
    const { data } = await axios.post<Record<string, unknown>>(
      BREVO_TRANSACTIONAL_SMS_URL,
      {
        sender: DEFAULT_SENDER,
        recipient: recipientDigits,
        content,
        type: "transactional",
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        timeout: 20_000,
      }
    );

    const messageId =
      typeof data?.messageId === "string"
        ? data.messageId
        : typeof (data as { id?: unknown }).id === "string"
          ? (data as { id: string }).id
          : undefined;

    return { sent: true, ...(messageId ? { messageId } : {}) };
  } catch (e) {
    if (isAxiosError(e)) {
      const status = e.response?.status;
      const resData = e.response?.data;
      let message = e.message;
      if (resData && typeof resData === "object" && "message" in resData) {
        const m = (resData as { message: unknown }).message;
        if (typeof m === "string") message = m;
        else if (m != null) message = String(m);
      }
      console.error("[Brevo SMS] Request failed", {
        status,
        message,
        data: resData,
      });
      return { sent: false, error: message };
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Brevo SMS] Unexpected error", msg);
    return { sent: false, error: msg };
  }
}
