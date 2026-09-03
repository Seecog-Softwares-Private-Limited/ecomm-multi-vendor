#!/usr/bin/env tsx
/**
 * Smoke tests for coupon usage limits + online payment consumption.
 *
 * Suite 1 — COD limits (maxUses=3, maxUsesPerUser=1):
 *   A success → A reject → B success → C success → D reject (global)
 *
 * Suite 2 — Online payment:
 *   Order created → usedCount unchanged
 *   Payment confirmed → usedCount +1 exactly once (duplicate webhook safe)
 *   Payment cancel/expiry → coupon not consumed
 *
 * Run: npm run smoke:coupon-limits
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { ApiRouteError } from "../src/lib/api";
import { prisma } from "../src/lib/prisma";
import { createCheckoutSession } from "../src/lib/commerce/checkout-session.service";
import { placeOrderFromCheckoutSession } from "../src/lib/commerce/order-placement.service";
import { confirmRazorpayPayment } from "../src/lib/commerce/payment-completion.service";
import { runCommerceCleanup } from "../src/lib/commerce/cleanup";
import { deriveOrderIdempotencyKey } from "../src/lib/commerce/idempotency";
import { generateCommerceId } from "../src/lib/commerce/id";

const TAG = `SMOKE-CPL-${Date.now()}`;

type Shopper = { userId: string; addressId: string; label: string };

const results: Array<{ name: string; pass: boolean; detail?: string }> = [];

function pass(name: string, detail?: string) {
  results.push({ name, pass: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  results.push({ name, pass: false, detail });
  console.error(`✗ ${name} — ${detail}`);
}

async function couponUsedCount(couponId: string): Promise<number> {
  const row = await prisma.coupon.findUnique({
    where: { id: couponId },
    select: { usedCount: true },
  });
  return row?.usedCount ?? 0;
}

async function createShopper(label: string): Promise<Shopper> {
  const email = `${TAG}-${label}@smoke.local`.toLowerCase();
  const user = await prisma.user.create({
    data: {
      email,
      firstName: "Smoke",
      lastName: label,
      phone: "9999999999",
      profileCompleted: true,
      emailVerified: true,
      addresses: {
        create: {
          type: "HOME",
          fullName: `Smoke ${label}`,
          line1: "1 Smoke Street",
          city: "Mumbai",
          state: "MH",
          pincode: "400001",
          phone: "9999999999",
          isDefault: true,
        },
      },
    },
    select: {
      id: true,
      addresses: { take: 1, select: { id: true } },
    },
  });
  const addressId = user.addresses[0]?.id;
  if (!addressId) throw new Error(`No address for ${label}`);
  return { userId: user.id, addressId, label };
}

async function placeWithCoupon(
  shopper: Shopper,
  productId: string,
  couponCode: string,
  paymentMethod: "cod" | "upi"
) {
  const { sessionId } = await createCheckoutSession(shopper.userId, {
    type: "BUY_NOW",
    lines: [{ productId, quantity: 1, variantKey: null }],
  });
  const placed = await placeOrderFromCheckoutSession({
    userId: shopper.userId,
    checkoutSessionId: sessionId,
    shippingAddressId: shopper.addressId,
    paymentMethod,
    couponCode,
    idempotencyKey: deriveOrderIdempotencyKey(sessionId),
  });
  return { ...placed, sessionId };
}

function errCode(err: unknown): string | null {
  if (err instanceof ApiRouteError) return err.code;
  return null;
}

async function createCoupon(opts: {
  code: string;
  maxUses: number | null;
  maxUsesPerUser: number | null;
}) {
  const now = new Date();
  return prisma.coupon.create({
    data: {
      code: opts.code,
      discountType: "FIXED",
      discountValue: 10,
      validFrom: new Date(now.getTime() - 60_000),
      validTo: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      maxUses: opts.maxUses,
      maxUsesPerUser: opts.maxUsesPerUser,
      usedCount: 0,
    },
  });
}

async function softDeleteCoupon(couponId: string) {
  await prisma.coupon.update({
    where: { id: couponId },
    data: { deletedAt: new Date() },
  });
}

async function suiteCodLimits(productId: string, shoppers: Shopper[]) {
  const code = `CPL${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  console.log(`\n--- Suite 1: COD limits (${code}, maxUses=3, maxUsesPerUser=1) ---`);
  const coupon = await createCoupon({ code, maxUses: 3, maxUsesPerUser: 1 });
  const [userA, userB, userC, userD] = shoppers;

  try {
    const a1 = await placeWithCoupon(userA, productId, code, "cod");
    assert.equal(await couponUsedCount(coupon.id), 1);
    pass("COD User A 1st → SUCCESS", `order ${a1.orderId}, usedCount=1`);

    try {
      await placeWithCoupon(userA, productId, code, "cod");
      fail("COD User A 2nd → REJECTED", new Error("expected rejection"));
    } catch (e) {
      assert.equal(errCode(e), "COUPON_USER_LIMIT");
      pass("COD User A 2nd → REJECTED", "COUPON_USER_LIMIT");
    }

    const b1 = await placeWithCoupon(userB, productId, code, "cod");
    assert.equal(await couponUsedCount(coupon.id), 2);
    pass("COD User B → SUCCESS", `order ${b1.orderId}, usedCount=2`);

    const c1 = await placeWithCoupon(userC, productId, code, "cod");
    assert.equal(await couponUsedCount(coupon.id), 3);
    pass("COD User C → SUCCESS", `order ${c1.orderId}, usedCount=3`);

    try {
      await placeWithCoupon(userD, productId, code, "cod");
      fail("COD User D → REJECTED (global)", new Error("expected rejection"));
    } catch (e) {
      assert.equal(errCode(e), "COUPON_EXhausted");
      pass("COD User D → REJECTED (global)", "COUPON_EXhausted");
    }

    assert.equal(await couponUsedCount(coupon.id), 3);
    pass("COD final usedCount", "3/3");
  } finally {
    await softDeleteCoupon(coupon.id);
  }
}

async function suiteOnlinePayment(productId: string, shoppers: Shopper[]) {
  const code = `CPO${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  console.log(`\n--- Suite 2: Online payment consumption (${code}) ---`);
  // Generous limits so this suite only tests consumption timing, not caps.
  const coupon = await createCoupon({ code, maxUses: 50, maxUsesPerUser: 10 });
  const [userPay, userCancel] = shoppers;

  try {
    // --- Confirm path: create → confirm once → usedCount +1; duplicate confirm no double-count ---
    const placed = await placeWithCoupon(userPay, productId, code, "upi");
    assert.equal(placed.requiresRazorpay, true, "UPI should require Razorpay");

    const afterCreate = await couponUsedCount(coupon.id);
    assert.equal(afterCreate, 0, "usedCount must stay 0 until payment confirmed");
    pass("Online: order created does not consume coupon", `order ${placed.orderId}, usedCount=0`);

    const orderRow = await prisma.order.findUnique({
      where: { id: placed.orderId },
      select: { status: true, couponId: true },
    });
    assert.equal(orderRow?.status, "PENDING_PAYMENT");
    assert.equal(orderRow?.couponId, coupon.id);

    const rzOrderId = `order_${generateCommerceId()}`;
    const rzPaymentId = `pay_${generateCommerceId()}`;
    await prisma.payment.updateMany({
      where: { orderId: placed.orderId },
      data: { razorpayOrderId: rzOrderId },
    });

    const first = await confirmRazorpayPayment({
      razorpayOrderId: rzOrderId,
      razorpayPaymentId: rzPaymentId,
      idempotencyKey: `webhook:${rzPaymentId}`,
      source: "webhook",
    });
    assert.equal(first.verified, true);
    assert.equal(first.recovered, false);

    const afterConfirm = await couponUsedCount(coupon.id);
    assert.equal(afterConfirm, 1, "usedCount must increase exactly once on confirm");
    pass("Online: payment confirmed → usedCount +1", `usedCount=${afterConfirm}`);

    const second = await confirmRazorpayPayment({
      razorpayOrderId: rzOrderId,
      razorpayPaymentId: rzPaymentId,
      idempotencyKey: `webhook:${rzPaymentId}`,
      source: "webhook",
    });
    assert.equal(second.recovered, true, "duplicate webhook must be idempotent");

    const afterDup = await couponUsedCount(coupon.id);
    assert.equal(afterDup, 1, "duplicate confirm must not double-consume");
    pass("Online: duplicate webhook → usedCount stays 1", `usedCount=${afterDup}`);

    // --- Cancel/expiry path: unpaid order cancelled → coupon not consumed ---
    const beforeCancel = await couponUsedCount(coupon.id);
    const abandoned = await placeWithCoupon(userCancel, productId, code, "upi");
    assert.equal(await couponUsedCount(coupon.id), beforeCancel, "pending online order must not consume");

    const past = new Date(Date.now() - 60_000);
    await prisma.checkoutSession.update({
      where: { id: abandoned.sessionId },
      data: { expiresAt: past },
    });
    await prisma.stockReservation.updateMany({
      where: { checkoutSessionId: abandoned.sessionId, status: "ACTIVE" },
      data: { expiresAt: past },
    });

    await runCommerceCleanup();

    const cancelled = await prisma.order.findUnique({
      where: { id: abandoned.orderId },
      select: { status: true },
    });
    assert.equal(cancelled?.status, "CANCELLED", "unpaid order should be cancelled after cleanup");

    const afterCancel = await couponUsedCount(coupon.id);
    assert.equal(afterCancel, beforeCancel, "cancelled unpaid order must not consume coupon");
    pass(
      "Online: payment cancel/expiry → coupon not consumed",
      `order ${abandoned.orderId} CANCELLED, usedCount=${afterCancel}`
    );

    // --- Explicit payment FAILED without confirm ---
    const beforeFail = await couponUsedCount(coupon.id);
    const failOrder = await placeWithCoupon(userCancel, productId, code, "upi");
    await prisma.payment.updateMany({
      where: { orderId: failOrder.orderId },
      data: { status: "FAILED" },
    });
    // Force-cancel like cleanup would, without confirming payment
    await prisma.order.update({
      where: { id: failOrder.orderId, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    });
    const afterFail = await couponUsedCount(coupon.id);
    assert.equal(afterFail, beforeFail, "FAILED payment must not consume coupon");
    pass(
      "Online: payment FAILED → coupon not consumed",
      `order ${failOrder.orderId}, usedCount=${afterFail}`
    );
  } finally {
    await softDeleteCoupon(coupon.id);
  }
}

async function main() {
  console.log(`\n${TAG} coupon smoke\n`);

  const product = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      stock: { gte: 10 },
      seller: { status: "APPROVED", deletedAt: null },
    },
    select: { id: true, name: true, stock: true },
  });
  if (!product) {
    throw new Error("No approved product with stock >= 10 found.");
  }
  console.log(`Product: ${product.name} (${product.id}), stock=${product.stock}`);

  const shoppers: Shopper[] = [];
  try {
    for (const label of ["A", "B", "C", "D", "Pay", "Cancel"]) {
      shoppers.push(await createShopper(label));
    }

    await suiteCodLimits(product.id, shoppers.slice(0, 4));
    await suiteOnlinePayment(product.id, shoppers.slice(4, 6));
  } catch (e) {
    fail("suite aborted", e);
    throw e;
  } finally {
    for (const s of shoppers) {
      await prisma.user.update({
        where: { id: s.userId },
        data: { deletedAt: new Date(), email: `deleted-${s.userId}@smoke.local` },
      });
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error("\nSmoke test aborted:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
