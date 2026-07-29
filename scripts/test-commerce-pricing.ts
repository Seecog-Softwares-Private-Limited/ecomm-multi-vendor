import assert from "node:assert/strict";
import {
  buildCheckoutTotals,
  computeLineSubtotal,
  detectPriceChanges,
  formatPriceChangeMessage,
  type PricedCheckoutLine,
} from "../src/lib/commerce/pricing.ts";

const lines: PricedCheckoutLine[] = [
  {
    productId: "p1",
    sellerId: "s1",
    variantKey: null,
    quantity: 2,
    unitSellingPrice: 100,
    unitMrp: 120,
    gstPercent: 18,
  },
];

assert.equal(computeLineSubtotal(lines), 200);

const totals = buildCheckoutTotals(lines, 10, null, null);
assert.equal(totals.subtotal, 200);
assert.equal(totals.discountAmount, 10);
assert.equal(totals.totalAmount, 200 - 10 + totals.shippingAmount + totals.taxAmount);

const changes = detectPriceChanges(
  [{ productId: "p1", variantKey: null, unitSellingPrice: 100, productName: "Shoe" }],
  [{ productId: "p1", variantKey: null, liveUnitPrice: 110, productName: "Shoe" }]
);
assert.equal(changes.length, 1);
assert.match(formatPriceChangeMessage(changes), /100\.00.*110\.00/);

console.log("commerce-pricing: ok");
