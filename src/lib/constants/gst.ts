/** Default GST % when a product has no explicit `gstPercent` in the database. */
export const DEFAULT_GST_PERCENT = 18;

/**
 * Catalog / selling prices already include GST.
 * Tax shown in summaries is the GST portion inside the price (not added on top).
 */
export const PRICES_INCLUDE_GST = true;

/** GST exclusive: tax = price × rate/100 (added on top of selling price). */
export function computeGstExclusive(amountInclusiveOfQty: number, gstPercent: number): number {
  if (!(gstPercent > 0) || !(amountInclusiveOfQty > 0)) return 0;
  return amountInclusiveOfQty * (gstPercent / 100);
}

/**
 * GST inclusive: tax portion embedded in the selling price.
 * tax = price × rate / (100 + rate)
 */
export function computeGstInclusivePortion(
  amountInclusiveOfQty: number,
  gstPercent: number
): number {
  if (!(gstPercent > 0) || !(amountInclusiveOfQty > 0)) return 0;
  return (amountInclusiveOfQty * gstPercent) / (100 + gstPercent);
}

/** Active GST amount helper based on {@link PRICES_INCLUDE_GST}. */
export function computeGstAmount(amountInclusiveOfQty: number, gstPercent: number): number {
  // Exclusive (add GST on top) — keep for easy rollback:
  // return computeGstExclusive(amountInclusiveOfQty, gstPercent);

  // Inclusive (prices already include GST):
  return computeGstInclusivePortion(amountInclusiveOfQty, gstPercent);
}
