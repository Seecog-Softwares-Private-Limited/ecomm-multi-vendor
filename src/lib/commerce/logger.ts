type CommerceEvent =
  | "checkout_session_created"
  | "checkout_session_expired"
  | "checkout_session_stale"
  | "payment_started"
  | "payment_verified"
  | "order_created"
  | "order_failed"
  | "stock_reserved"
  | "stock_released"
  | "stock_consumed"
  | "cart_merged"
  | "price_change_detected";

/** Structured commerce logging — never log PII or payment secrets. */
export function logCommerceEvent(
  event: CommerceEvent,
  meta: Record<string, string | number | boolean | null | undefined>
): void {
  console.info(JSON.stringify({ scope: "commerce", event, ...meta, ts: new Date().toISOString() }));
}
