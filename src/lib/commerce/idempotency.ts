import { createHash } from "crypto";

/** Deterministic idempotency key from checkout session (safe client fallback). */
export function deriveOrderIdempotencyKey(checkoutSessionId: string): string {
  return `order-session:${checkoutSessionId}`;
}

/** Resolve idempotency key: client header/body first, then deterministic session key. */
export function resolveOrderIdempotencyKey(
  checkoutSessionId: string,
  clientKey: string | null | undefined
): string {
  const trimmed = clientKey?.trim();
  if (trimmed) return trimmed.slice(0, 64);
  return deriveOrderIdempotencyKey(checkoutSessionId);
}

/**
 * Stable key for legacy flows before session id is known (hash cart + coupon).
 * Coupon must be part of the key so applying a discount creates a new pending
 * order instead of recovering an unpaid full-price Razorpay order.
 */
export function deriveLegacyCartIdempotencyKey(
  userId: string,
  cartItemIds: string[],
  couponCode?: string | null
): string {
  const sorted = [...cartItemIds].sort().join(",");
  const coupon = (couponCode ?? "").trim().toUpperCase();
  const hash = createHash("sha256")
    .update(`${userId}:${sorted}:coupon=${coupon}`)
    .digest("hex")
    .slice(0, 32);
  return `order-legacy:${hash}`;
}
