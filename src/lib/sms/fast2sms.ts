/**
 * Fast2SMS (India) — https://www.fast2sms.com/dev/bulkV2
 * Set FAST2SMS_API_KEY from Dashboard → Dev API.
 *
 * Fast2SMS often requires “website verification” before the OTP route works.
 * We auto-retry with Quick SMS route `q` unless FAST2SMS_OTP_FALLBACK_Q=false.
 *
 * Note: Quick SMS (route q) is often treated as promotional; numbers on TRAI DND
 * may not receive it. For reliable OTP to all users, use DLT (FAST2SMS_ROUTE=dlt).
 */

const BULK_V2 = "https://www.fast2sms.com/dev/bulkV2";

type SmsSendResult = { sent: boolean; error?: string; requestId?: string };

function flashFlag(): string {
  return process.env.FAST2SMS_FLASH === "1" ? "1" : "0";
}

/** E.164 +91… or digits → 10-digit Indian mobile for Fast2SMS `numbers`. */
export function e164ToIndian10(e164: string): string | null {
  const d = e164.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return d.slice(2);
  if (d.length === 10 && /^[6-9]/.test(d)) return d;
  return null;
}

function isFast2smsSuccess(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const r = (data as Record<string, unknown>).return;
  return r === true || r === "true" || r === 1 || r === "1";
}

function formatFast2smsError(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Invalid response from SMS gateway";
  }
  const o = data as Record<string, unknown>;
  const msg = o.message;
  if (Array.isArray(msg)) return msg.join("; ").slice(0, 300);
  if (typeof msg === "string") return msg.slice(0, 300);
  return JSON.stringify(data).slice(0, 300);
}

function extractRequestId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const id = (data as Record<string, unknown>).request_id;
  return typeof id === "string" ? id : undefined;
}

/** Ask Fast2SMS to include billing / delivery hints in JSON (see their docs). */
function withSmsDetails(body: Record<string, string>): Record<string, string> {
  if (process.env.FAST2SMS_SMS_DETAILS === "0") return { ...body };
  return { ...body, sms_details: "1" };
}

async function tryFast2smsRequest(
  apiKey: string,
  body: Record<string, string>
): Promise<{ data: unknown; httpOk: boolean }> {
  const jsonRes = await fetch(BULK_V2, {
    method: "POST",
    headers: {
      authorization: apiKey,
      Accept: "*/*",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const jsonData: unknown = await jsonRes.json().catch(() => ({}));
  if (isFast2smsSuccess(jsonData)) {
    return { data: jsonData, httpOk: jsonRes.ok };
  }

  const form = new URLSearchParams(body);
  const formRes = await fetch(BULK_V2, {
    method: "POST",
    headers: {
      authorization: apiKey,
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: form.toString(),
    cache: "no-store",
  });
  const formData: unknown = await formRes.json().catch(() => ({}));
  if (isFast2smsSuccess(formData)) {
    return { data: formData, httpOk: formRes.ok };
  }

  const url = new URL(BULK_V2);
  url.searchParams.set("authorization", apiKey);
  for (const [k, v] of Object.entries(body)) {
    url.searchParams.set(k, v);
  }
  const getRes = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const getData: unknown = await getRes.json().catch(() => ({}));
  return { data: getData, httpOk: getRes.ok };
}

async function sendFast2smsOnce(
  apiKey: string,
  body: Record<string, string>
): Promise<SmsSendResult> {
  const payload = withSmsDetails(body);
  try {
    const { data, httpOk } = await tryFast2smsRequest(apiKey, payload);
    if (isFast2smsSuccess(data)) {
      const requestId = extractRequestId(data);
      if (process.env.NODE_ENV === "development") {
        console.log("[Fast2SMS] Gateway accepted SMS. Full response:", JSON.stringify(data));
        if (requestId) {
          console.log(
            `[Fast2SMS] request_id=${requestId} — open Fast2SMS dashboard → Reports / Delivery to see status.`
          );
        }
      }
      return { sent: true, requestId };
    }
    const errText = formatFast2smsError(data);
    const suffix = httpOk ? "" : " (HTTP error from gateway)";
    if (process.env.NODE_ENV === "development") {
      console.warn("[Fast2SMS] Request failed:", errText, data);
    }
    return { sent: false, error: `${errText}${suffix}`.slice(0, 400) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fast2SMS request failed";
    return { sent: false, error: message };
  }
}

/** Fast2SMS blocks OTP API until dashboard “website verification”; detect and fall back to Quick SMS. */
function shouldFallbackOtpRouteToQuick(error: string): boolean {
  const disabled =
    process.env.FAST2SMS_OTP_FALLBACK_Q === "0" ||
    process.env.FAST2SMS_OTP_FALLBACK_Q === "false";
  if (disabled) return false;
  return /website verification|OTP Message|complete website|DLT SMS API/i.test(error);
}

/**
 * Send login OTP via Fast2SMS.
 * - Route `otp` (default): transactional OTP channel; body uses `variables_values` = code only.
 * - Route `q`: Quick SMS; full text in `message`.
 * - Route `dlt`: needs FAST2SMS_SENDER_ID + FAST2SMS_MESSAGE_ID (template ID).
 */
export async function sendLoginOtpFast2sms(
  e164: string,
  code: string,
  messageText: string
): Promise<SmsSendResult> {
  const apiKey =
    process.env.FAST2SMS_API_KEY?.trim() || process.env.FAST2SMS_AUTHORIZATION?.trim();
  if (!apiKey) {
    return { sent: false };
  }

  const numbers = e164ToIndian10(e164);
  if (!numbers) {
    return { sent: false, error: "Invalid Indian mobile number for SMS." };
  }

  const route = (process.env.FAST2SMS_ROUTE?.trim() || "otp").toLowerCase();

  let body: Record<string, string>;

  if (route === "otp") {
    body = {
      route: "otp",
      numbers,
      variables_values: code,
      flash: flashFlag(),
    };
  } else if (route === "q") {
    body = {
      route: "q",
      numbers,
      message: messageText,
      flash: flashFlag(),
    };
  } else if (route === "dlt") {
    const senderId = process.env.FAST2SMS_SENDER_ID?.trim();
    const messageId = process.env.FAST2SMS_MESSAGE_ID?.trim();
    if (!senderId || !messageId) {
      return {
        sent: false,
        error: "FAST2SMS_SENDER_ID and FAST2SMS_MESSAGE_ID are required when FAST2SMS_ROUTE=dlt.",
      };
    }
    const vars = process.env.FAST2SMS_VARIABLES_VALUES?.trim() ?? code;
    body = {
      route: "dlt",
      sender_id: senderId,
      message: messageId,
      variables_values: vars,
      numbers,
      flash: "0",
    };
  } else {
    body = {
      route,
      numbers,
      message: messageText,
      flash: "0",
    };
  }

  let result = await sendFast2smsOnce(apiKey, body);

  if (
    !result.sent &&
    route === "otp" &&
    result.error &&
    shouldFallbackOtpRouteToQuick(result.error)
  ) {
    const quickBody: Record<string, string> = {
      route: "q",
      numbers,
      message: messageText,
      flash: flashFlag(),
    };
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Fast2SMS] OTP route requires dashboard verification; retrying with Quick SMS (route q)."
      );
    }
    result = await sendFast2smsOnce(apiKey, quickBody);
  }

  return result;
}
