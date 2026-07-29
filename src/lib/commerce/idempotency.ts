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

/** Stable key for legacy flows before session id is known (hash cart snapshot). */
export function deriveLegacyCartIdempotencyKey(userId: string, cartItemIds: string[]): string {
  const sorted = [...cartItemIds].sort().join(",");
  const hash = createHash("sha256").update(`${userId}:${sorted}`).digest("hex").slice(0, 32);
  return `order-legacy:${hash}`;
}
