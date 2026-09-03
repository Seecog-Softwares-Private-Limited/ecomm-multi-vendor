/**
 * Unit checks for admin coupon parse helpers (no DB).
 * Run: npx tsx scripts/test-admin-coupons.ts
 */
import {
  parseCouponBody,
  normalizeCouponCode,
  computeCouponStatus,
} from "../src/lib/admin/coupons";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

assert(normalizeCouponCode(" save10 ") === "SAVE10", "uppercase trim");
assert(normalizeCouponCode("") === "", "empty");

const valid = parseCouponBody({
  code: "save10",
  discountType: "PERCENT",
  discountValue: 10,
  validFrom: "2026-09-01T00:00:00.000Z",
  validTo: "2026-12-31T23:59:59.000Z",
  maxUses: 100,
  maxUsesPerUser: 1,
  status: "Active",
});
assert(valid.ok && valid.data.code === "SAVE10", "valid percent");
assert(valid.ok && valid.data.discountType === "PERCENT", "type percent");
assert(valid.ok && valid.data.maxUses === 100, "maxUses 100");
assert(valid.ok && valid.data.maxUsesPerUser === 1, "maxUsesPerUser 1");

const fixed = parseCouponBody({
  code: "FLAT50",
  discountType: "FIXED",
  discountValue: 50,
  validFrom: "2026-09-01T00:00:00.000Z",
  validTo: "2026-12-31T23:59:59.000Z",
  maxUses: null,
  maxUsesPerUser: null,
  status: "Active",
});
assert(fixed.ok && fixed.data.maxUses === null, "unlimited maxUses");
assert(fixed.ok && fixed.data.maxUsesPerUser === null, "unlimited maxUsesPerUser");

assert(!parseCouponBody({ code: "", discountType: "PERCENT", discountValue: 10, validFrom: "2026-01-01", validTo: "2026-12-31" }).ok, "empty code");
assert(!parseCouponBody({ code: "X", discountType: "PERCENT", discountValue: 0, validFrom: "2026-01-01", validTo: "2026-12-31" }).ok, "percent 0");
assert(!parseCouponBody({ code: "X", discountType: "PERCENT", discountValue: 101, validFrom: "2026-01-01", validTo: "2026-12-31" }).ok, "percent 101");
assert(!parseCouponBody({ code: "X", discountType: "FIXED", discountValue: -1, validFrom: "2026-01-01", validTo: "2026-12-31" }).ok, "fixed negative");
assert(!parseCouponBody({ code: "X", discountType: "PERCENT", discountValue: 10, validFrom: "2026-12-31", validTo: "2026-01-01" }).ok, "bad date range");
assert(!parseCouponBody({ code: "X", discountType: "PERCENT", discountValue: 10, validFrom: "2026-01-01", validTo: "2026-12-31", maxUses: 0 }).ok, "maxUses 0");
assert(!parseCouponBody({ code: "X", discountType: "PERCENT", discountValue: 10, validFrom: "2026-01-01", validTo: "2026-12-31", maxUsesPerUser: 0 }).ok, "maxUsesPerUser 0");
assert(
  !parseCouponBody({
    code: "X",
    discountType: "PERCENT",
    discountValue: 10,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    maxUses: 5,
    maxUsesPerUser: 6,
  }).ok,
  "per-user > global"
);
assert(
  parseCouponBody({
    code: "X",
    discountType: "PERCENT",
    discountValue: 10,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    maxUses: null,
    maxUsesPerUser: 3,
  }).ok,
  "per-user allowed when global unlimited"
);
assert(!parseCouponBody({ code: "X", discountType: "FLAT", discountValue: 10, validFrom: "2026-01-01", validTo: "2026-12-31" }).ok, "invalid type FLAT");

const now = new Date("2026-06-15T12:00:00.000Z");
assert(
  computeCouponStatus({
    deletedAt: new Date(),
    validFrom: new Date("2026-01-01"),
    validTo: new Date("2026-12-31"),
    maxUses: null,
    usedCount: 0,
    now,
  }) === "Inactive",
  "inactive"
);
assert(
  computeCouponStatus({
    deletedAt: null,
    validFrom: new Date("2026-07-01"),
    validTo: new Date("2026-12-31"),
    maxUses: null,
    usedCount: 0,
    now,
  }) === "Scheduled",
  "scheduled"
);
assert(
  computeCouponStatus({
    deletedAt: null,
    validFrom: new Date("2026-01-01"),
    validTo: new Date("2026-05-01"),
    maxUses: null,
    usedCount: 0,
    now,
  }) === "Expired",
  "expired"
);
assert(
  computeCouponStatus({
    deletedAt: null,
    validFrom: new Date("2026-01-01"),
    validTo: new Date("2026-12-31"),
    maxUses: 10,
    usedCount: 10,
    now,
  }) === "Exhausted",
  "exhausted"
);
assert(
  computeCouponStatus({
    deletedAt: null,
    validFrom: new Date("2026-01-01"),
    validTo: new Date("2026-12-31"),
    maxUses: 10,
    usedCount: 2,
    now,
  }) === "Active",
  "active"
);

console.log("OK: admin coupon validation helpers passed");
