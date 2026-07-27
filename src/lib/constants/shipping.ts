/**
 * Marketplace delivery fees (INR).
 * Set SHIPPING_COST to e.g. 50 and SHIPPING_FREE_THRESHOLD to e.g. 500 when charging again.
 */
export const SHIPPING_COST = 0;

/** Waived when subtotal >= this amount (ignored while SHIPPING_COST is 0). */
export const SHIPPING_FREE_THRESHOLD = 500;

export function calculateShippingAmount(subtotalAfterDiscount: number): number {
  if (SHIPPING_COST <= 0) return 0;
  return subtotalAfterDiscount >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
}

export function isShippingPromoEnabled(): boolean {
  return SHIPPING_COST > 0;
}
