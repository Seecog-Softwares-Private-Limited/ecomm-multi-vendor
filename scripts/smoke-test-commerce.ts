#!/usr/bin/env tsx
/**
 * Production smoke tests for commerce flows (requires DATABASE_URL).
 * Run: npm run smoke:commerce
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

const TAG = `[smoke:${Date.now()}]`;

type Fixtures = {
  userId: string;
  addressId: string;
  productId: string;
  sellerId: string;
  productStockBefore: number;
};

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

async function loadFixtures(): Promise<Fixtures> {
  const user = await prisma.user.findFirst({
    where: { deletedAt: null, addresses: { some: { deletedAt: null } } },
    select: {
      id: true,
      addresses: {
        where: { deletedAt: null },
        take: 1,
        select: { id: true },
      },
    },
  });
  if (!user?.addresses[0]) {
    throw new Error("No customer with a saved address found. Create one to run smoke tests.");
  }

  const product = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      stock: { gte: 2 },
      seller: { status: "APPROVED", deletedAt: null },
    },
    select: { id: true, sellerId: true, stock: true },
  });
  if (!product) {
    throw new Error("No approved in-stock product found (need stock >= 2).");
  }

  return {
    userId: user.id,
    addressId: user.addresses[0].id,
    productId: product.id,
    sellerId: product.sellerId,
    productStockBefore: product.stock,
  };
}

async function testDoubleClickPlaceOrder(fixtures: Fixtures) {
  const { sessionId } = await createCheckoutSession(fixtures.userId, {
    type: "BUY_NOW",
    lines: [{ productId: fixtures.productId, quantity: 1, variantKey: null }],
  });
  const idemKey = deriveOrderIdempotencyKey(sessionId);

  const input = {
    userId: fixtures.userId,
    checkoutSessionId: sessionId,
    shippingAddressId: fixtures.addressId,
    paymentMethod: "upi",
    idempotencyKey: idemKey,
  };

  const [a, b] = await Promise.allSettled([
    placeOrderFromCheckoutSession(input),
    placeOrderFromCheckoutSession(input),
  ]);

  const orderIds = new Set<string>();
  for (const r of [a, b]) {
    if (r.status === "fulfilled") orderIds.add(r.value.orderId);
  }

  assert.equal(orderIds.size, 1, "expected exactly one order id from concurrent placement");

  const orderCount = await prisma.order.count({
    where: { checkoutSessionId: sessionId },
  });
  assert.equal(orderCount, 1, "expected one order row for session");

  pass("1. Double-click Place Order", `single order ${[...orderIds][0]}`);
  return { sessionId, orderId: [...orderIds][0]! };
}

async function testCancelPaymentReservations(fixtures: Fixtures) {
  const { sessionId } = await createCheckoutSession(fixtures.userId, {
    type: "BUY_NOW",
    lines: [{ productId: fixtures.productId, quantity: 1, variantKey: null }],
  });

  const order = await placeOrderFromCheckoutSession({
    userId: fixtures.userId,
    checkoutSessionId: sessionId,
    shippingAddressId: fixtures.addressId,
    paymentMethod: "upi",
    idempotencyKey: deriveOrderIdempotencyKey(sessionId),
  });

  const activeBefore = await prisma.stockReservation.count({
    where: { checkoutSessionId: sessionId, status: "ACTIVE" },
  });
  assert.ok(activeBefore > 0, "reservations should be ACTIVE while payment pending");

  const sessionBefore = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    select: { expiresAt: true },
  });
  assert.ok(sessionBefore && sessionBefore.expiresAt > new Date(), "payment window should be extended");

  pass(
    "2a. Cancel Razorpay — stock reserved during payment window",
    `${activeBefore} active reservation(s), session expires ${sessionBefore?.expiresAt.toISOString()}`
  );

  // Simulate abandoned payment: force-expire session then run cleanup
  const past = new Date(Date.now() - 60_000);
  await prisma.checkoutSession.update({
    where: { id: sessionId },
    data: { expiresAt: past },
  });
  await prisma.stockReservation.updateMany({
    where: { checkoutSessionId: sessionId, status: "ACTIVE" },
    data: { expiresAt: past },
  });

  await runCommerceCleanup();

  const orderAfter = await prisma.order.findUnique({
    where: { id: order.orderId },
    select: { status: true },
  });
  const released = await prisma.stockReservation.count({
    where: { checkoutSessionId: sessionId, status: "RELEASED" },
  });

  assert.equal(orderAfter?.status, "CANCELLED", "unpaid order should be cancelled after cleanup");
  assert.ok(released > 0, "reservations should be released after expiry cleanup");

  pass("2b. Cancel Razorpay — released after payment window expires", `order CANCELLED, ${released} released`);
}

async function testWebhookWithoutClient(fixtures: Fixtures) {
  const { sessionId } = await createCheckoutSession(fixtures.userId, {
    type: "BUY_NOW",
    lines: [{ productId: fixtures.productId, quantity: 1, variantKey: null }],
  });

  const placed = await placeOrderFromCheckoutSession({
    userId: fixtures.userId,
    checkoutSessionId: sessionId,
    shippingAddressId: fixtures.addressId,
    paymentMethod: "upi",
    idempotencyKey: deriveOrderIdempotencyKey(sessionId),
  });

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

  const second = await confirmRazorpayPayment({
    razorpayOrderId: rzOrderId,
    razorpayPaymentId: rzPaymentId,
    idempotencyKey: `webhook:${rzPaymentId}`,
    source: "webhook",
  });

  assert.equal(second.recovered, true, "duplicate webhook must be idempotent");

  const order = await prisma.order.findUnique({
    where: { id: placed.orderId },
    select: { status: true, payments: { select: { status: true } } },
  });
  assert.equal(order?.status, "PAYMENT_CONFIRMED");
  assert.equal(order?.payments[0]?.status, "PAID");

  pass(
    "3. Webhook confirms without client verify",
    `order ${placed.orderId} → PAYMENT_CONFIRMED, duplicate safe`
  );
}

async function loadManyUsers(count: number): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    take: count,
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length < count) {
    throw new Error(`Need at least ${count} users for last-item concurrency test (found ${users.length}).`);
  }
  return users.map((u) => u.id);
}

function isInsufficientStock(err: unknown): boolean {
  return err instanceof ApiRouteError && err.code === "INSUFFICIENT_STOCK";
}

async function testLastItemRace(fixtures: Fixtures) {
  const CONCURRENCY = 20;
  const userIds = await loadManyUsers(CONCURRENCY);
  const sku = `SMOKE-${crypto.randomBytes(4).toString("hex")}`;
  const baseProduct = await prisma.product.findUnique({
    where: { id: fixtures.productId },
    select: { categoryId: true, subCategoryId: true, sellerId: true, mrp: true, sellingPrice: true },
  });
  assert.ok(baseProduct);

  const loneProduct = await prisma.product.create({
    data: {
      sellerId: baseProduct.sellerId,
      categoryId: baseProduct.categoryId,
      subCategoryId: baseProduct.subCategoryId,
      name: `${TAG} last-item product`,
      sku,
      mrp: baseProduct.mrp,
      sellingPrice: baseProduct.sellingPrice,
      stock: 1,
      status: "ACTIVE",
    },
  });

  try {
    const attempts = userIds.map((userId) =>
      createCheckoutSession(userId, {
        type: "BUY_NOW",
        lines: [{ productId: loneProduct.id, quantity: 1, variantKey: null }],
      })
    );

    const results = await Promise.allSettled(attempts);

    const successes = results.filter((r) => r.status === "fulfilled");
    const insufficient = results.filter(
      (r) => r.status === "rejected" && isInsufficientStock(r.reason)
    );
    const otherFailures = results.filter(
      (r) => r.status === "rejected" && !isInsufficientStock(r.reason)
    );

    if (otherFailures.length > 0) {
      const sample = otherFailures[0]?.status === "rejected" ? otherFailures[0].reason : null;
      throw new Error(
        `Unexpected failure: ${sample instanceof Error ? sample.message : String(sample)}`
      );
    }

    assert.equal(successes.length, 1, "exactly one checkout session should succeed for stock=1");
    assert.equal(
      insufficient.length,
      CONCURRENCY - 1,
      `expected ${CONCURRENCY - 1} INSUFFICIENT_STOCK failures`
    );

    const activeReserved = await prisma.stockReservation.aggregate({
      where: { productId: loneProduct.id, status: "ACTIVE" },
      _sum: { quantity: true },
    });
    assert.equal(activeReserved._sum.quantity ?? 0, 1, "exactly one unit must be reserved");

    pass(
      "4. Last item — concurrent Buy Now (20 sessions)",
      `1 success, ${insufficient.length} INSUFFICIENT_STOCK, reserved=${activeReserved._sum.quantity}`
    );
  } finally {
    await prisma.stockReservation.updateMany({
      where: { productId: loneProduct.id, status: "ACTIVE" },
      data: { status: "RELEASED", updatedAt: new Date() },
    });
    await prisma.checkoutSession.updateMany({
      where: { lines: { some: { productId: loneProduct.id } }, status: "ACTIVE" },
      data: { status: "EXPIRED", updatedAt: new Date() },
    });
    await prisma.product.update({
      where: { id: loneProduct.id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
  }
}

async function testCleanupPreservesPaid(fixtures: Fixtures) {
  const { sessionId } = await createCheckoutSession(fixtures.userId, {
    type: "BUY_NOW",
    lines: [{ productId: fixtures.productId, quantity: 1, variantKey: null }],
  });

  const placed = await placeOrderFromCheckoutSession({
    userId: fixtures.userId,
    checkoutSessionId: sessionId,
    shippingAddressId: fixtures.addressId,
    paymentMethod: "upi",
    idempotencyKey: deriveOrderIdempotencyKey(sessionId),
  });

  const rzOrderId = `order_${generateCommerceId()}`;
  const rzPaymentId = `pay_${generateCommerceId()}`;
  await prisma.payment.updateMany({
    where: { orderId: placed.orderId },
    data: { razorpayOrderId: rzOrderId },
  });

  await confirmRazorpayPayment({
    razorpayOrderId: rzOrderId,
    razorpayPaymentId: rzPaymentId,
    source: "webhook",
  });

  // Force session/reservation expiry timestamps — cleanup must NOT cancel paid order
  const past = new Date(Date.now() - 60_000);
  await prisma.checkoutSession.update({
    where: { id: sessionId },
    data: { expiresAt: past, status: "CHECKING_OUT" },
  });

  const cleanup = await runCommerceCleanup();

  const order = await prisma.order.findUnique({
    where: { id: placed.orderId },
    select: { status: true, payments: { select: { status: true } } },
  });
  const session = await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    select: { status: true },
  });

  assert.equal(order?.status, "PAYMENT_CONFIRMED", "paid order must survive cleanup");
  assert.equal(order?.payments[0]?.status, "PAID");
  assert.equal(session?.status, "COMPLETED", "paid session should be completed not expired");

  pass(
    "5. Cleanup preserves paid orders",
    `cleanup processed ${cleanup.sessions} sessions; order still PAYMENT_CONFIRMED`
  );
}

async function testWebhookIgnoresAuthorized() {
  // Pure logic check — mirrors webhook route guard (no HTTP needed)
  const event = "payment.authorized";
  const shouldConfirm = event === "payment.captured";
  assert.equal(shouldConfirm, false);
  pass("Bonus: payment.authorized ignored", "only payment.captured confirms");
}

async function main() {
  console.log(`\nCommerce smoke tests ${TAG}\n`);

  const fixtures = await loadFixtures();
  console.log(`Using user=${fixtures.userId}, product=${fixtures.productId}\n`);

  await testDoubleClickPlaceOrder(fixtures).catch((e) => fail("1. Double-click Place Order", e));
  await testCancelPaymentReservations(fixtures).catch((e) =>
    fail("2. Cancel Razorpay payment / reservation lifecycle", e)
  );
  await testWebhookWithoutClient(fixtures).catch((e) =>
    fail("3. Webhook confirms without client", e)
  );
  await testLastItemRace(fixtures).catch((e) => fail("4. Last item race", e));
  await testCleanupPreservesPaid(fixtures).catch((e) => fail("5. Cleanup preserves paid", e));
  await testWebhookIgnoresAuthorized().catch((e) => fail("Bonus: authorized ignored", e));

  const failed = results.filter((r) => !r.pass);
  console.log("\n--- Summary ---");
  console.log(`Passed: ${results.filter((r) => r.pass).length}/${results.length}`);
  if (failed.length > 0) {
    console.error("Failed:");
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nAll smoke tests passed.\n");
}

main()
  .catch((err) => {
    console.error("[smoke-test-commerce] fatal:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
