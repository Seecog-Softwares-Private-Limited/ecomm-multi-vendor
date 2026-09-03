/**
 * Unit checks for coupon global + per-user usage limit helpers (no DB).
 * Run: npx tsx scripts/test-coupon-usage-limits.ts
 */
import assert from "node:assert/strict";
import {
  isGlobalCouponExhausted,
  isPerUserCouponExhausted,
  successfulCouponRedemptionWhere,
} from "../src/lib/commerce/coupon-usage";

// --- Global maximum usage ---
assert.equal(
  isGlobalCouponExhausted({ maxUses: 500, usedCount: 499 }),
  false,
  "global: under limit allowed"
);
assert.equal(
  isGlobalCouponExhausted({ maxUses: 500, usedCount: 500 }),
  true,
  "global: at limit exhausted"
);
assert.equal(
  isGlobalCouponExhausted({ maxUses: 500, usedCount: 501 }),
  true,
  "global: over limit exhausted"
);
assert.equal(
  isGlobalCouponExhausted({ maxUses: null, usedCount: 9999 }),
  false,
  "global: null maxUses = unlimited"
);
assert.equal(
  isGlobalCouponExhausted({ maxUses: 1, usedCount: null }),
  false,
  "global: null usedCount treated as 0"
);

// --- Per-user maximum usage ---
assert.equal(
  isPerUserCouponExhausted({ maxUsesPerUser: 1 }, 0),
  false,
  "per-user: first use allowed"
);
assert.equal(
  isPerUserCouponExhausted({ maxUsesPerUser: 1 }, 1),
  true,
  "per-user: second use rejected"
);
assert.equal(
  isPerUserCouponExhausted({ maxUsesPerUser: 2 }, 1),
  false,
  "per-user: under personal limit"
);
assert.equal(
  isPerUserCouponExhausted({ maxUsesPerUser: null }, 100),
  false,
  "per-user: null = unlimited (existing coupons)"
);

// --- Both limits simultaneously (logic composition) ---
function wouldAllow(opts: {
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
  userUsed: number;
}): boolean {
  if (isGlobalCouponExhausted({ maxUses: opts.maxUses, usedCount: opts.usedCount })) return false;
  if (isPerUserCouponExhausted({ maxUsesPerUser: opts.maxUsesPerUser }, opts.userUsed)) return false;
  return true;
}

assert.equal(
  wouldAllow({ maxUses: 500, usedCount: 10, maxUsesPerUser: 1, userUsed: 0 }),
  true,
  "user A first redemption allowed"
);
assert.equal(
  wouldAllow({ maxUses: 500, usedCount: 11, maxUsesPerUser: 1, userUsed: 1 }),
  false,
  "user A second redemption rejected (personal limit)"
);
assert.equal(
  wouldAllow({ maxUses: 500, usedCount: 11, maxUsesPerUser: 1, userUsed: 0 }),
  true,
  "user B independent per-user limit"
);
assert.equal(
  wouldAllow({ maxUses: 500, usedCount: 500, maxUsesPerUser: 1, userUsed: 0 }),
  false,
  "global limit blocks even unused personal quota"
);
assert.equal(
  wouldAllow({ maxUses: 500, usedCount: 499, maxUsesPerUser: 1, userUsed: 1 }),
  false,
  "personal limit can block before global is reached"
);
assert.equal(
  wouldAllow({ maxUses: null, usedCount: 0, maxUsesPerUser: null, userUsed: 50 }),
  true,
  "existing coupon style: both unlimited"
);

// --- Successful redemption where-clause shape (failed/cancelled unpaid online excluded) ---
const where = successfulCouponRedemptionWhere("coupon-1", "user-1", "order-current");
assert.equal(where.couponId, "coupon-1");
assert.equal(where.userId, "user-1");
assert.deepEqual(where.id, { not: "order-current" });
assert.ok(Array.isArray(where.OR) && where.OR.length === 2, "counts PAID or COD non-pending");

const whereNoExclude = successfulCouponRedemptionWhere("c", "u");
assert.equal(whereNoExclude.id, undefined, "no exclude when omitted");

console.log("coupon-usage-limits: ok");
