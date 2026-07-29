#!/usr/bin/env tsx
/**
 * Concurrency stress test: many simultaneous Buy Now sessions against stock = 1.
 * Run: npm run stress:stock-reservation
 *
 * Expected: exactly 1 success, all others INSUFFICIENT_STOCK, no overselling.
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { ApiRouteError } from "../src/lib/api";
import { createCheckoutSession } from "../src/lib/commerce/checkout-session.service";
import { prisma } from "../src/lib/prisma";

const CONCURRENCY = 25;
const RUNS = 3;
const TAG = `stress-${Date.now()}`;

function isInsufficientStock(err: unknown): boolean {
  return err instanceof ApiRouteError && err.code === "INSUFFICIENT_STOCK";
}

async function loadUsers(count: number): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    take: count,
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length < count) {
    throw new Error(`Need at least ${count} users in DB for stress test (found ${users.length}).`);
  }
  return users.map((u) => u.id);
}

async function createStressProduct(templateProductId: string) {
  const base = await prisma.product.findUnique({
    where: { id: templateProductId },
    select: {
      sellerId: true,
      categoryId: true,
      subCategoryId: true,
      mrp: true,
      sellingPrice: true,
    },
  });
  assert.ok(base);

  return prisma.product.create({
    data: {
      sellerId: base.sellerId,
      categoryId: base.categoryId,
      subCategoryId: base.subCategoryId,
      name: `${TAG} concurrency product`,
      sku: `STRESS-${crypto.randomBytes(6).toString("hex")}`,
      mrp: base.mrp,
      sellingPrice: base.sellingPrice,
      stock: 1,
      status: "ACTIVE",
    },
  });
}

async function runOnce(userIds: string[], templateProductId: string): Promise<void> {
  const product = await createStressProduct(templateProductId);

  try {
    const attempts = userIds.map((userId) =>
      createCheckoutSession(userId, {
        type: "BUY_NOW",
        lines: [{ productId: product.id, quantity: 1, variantKey: null }],
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
        `Unexpected failure type: ${sample instanceof Error ? sample.message : String(sample)}`
      );
    }

    assert.equal(successes.length, 1, `expected 1 success, got ${successes.length}`);
    assert.equal(
      insufficient.length,
      CONCURRENCY - 1,
      `expected ${CONCURRENCY - 1} INSUFFICIENT_STOCK, got ${insufficient.length}`
    );

    const activeReserved = await prisma.stockReservation.aggregate({
      where: { productId: product.id, status: "ACTIVE" },
      _sum: { quantity: true },
    });
    assert.equal(
      activeReserved._sum.quantity ?? 0,
      1,
      `expected 1 unit reserved, got ${activeReserved._sum.quantity ?? 0}`
    );

    const freshProduct = await prisma.product.findUnique({
      where: { id: product.id },
      select: { stock: true },
    });
    assert.ok(freshProduct && freshProduct.stock >= 0, "product stock must not go negative");

    const sessionCount = await prisma.checkoutSession.count({
      where: {
        status: "ACTIVE",
        lines: { some: { productId: product.id } },
      },
    });
    assert.equal(sessionCount, 1, `expected 1 ACTIVE session, got ${sessionCount}`);

    console.log(
      `  run ok: 1 success, ${insufficient.length} INSUFFICIENT_STOCK, reserved=${activeReserved._sum.quantity}`
    );
  } finally {
    await prisma.stockReservation.updateMany({
      where: { productId: product.id, status: "ACTIVE" },
      data: { status: "RELEASED", updatedAt: new Date() },
    });
    await prisma.checkoutSession.updateMany({
      where: { lines: { some: { productId: product.id } }, status: "ACTIVE" },
      data: { status: "EXPIRED", updatedAt: new Date() },
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
  }
}

async function main() {
  console.log(`\nStock reservation stress test (${CONCURRENCY} concurrent × ${RUNS} runs)\n`);

  const template = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      seller: { status: "APPROVED", deletedAt: null },
    },
    select: { id: true },
  });
  if (!template) {
    throw new Error("No active product found to use as template for stress test.");
  }

  const userIds = await loadUsers(CONCURRENCY);

  for (let run = 1; run <= RUNS; run++) {
    console.log(`Run ${run}/${RUNS}:`);
    await runOnce(userIds, template.id);
  }

  console.log(`\nAll ${RUNS} stress runs passed.\n`);
}

main()
  .catch((err) => {
    console.error("[stress-test-stock-reservation] FAILED:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
