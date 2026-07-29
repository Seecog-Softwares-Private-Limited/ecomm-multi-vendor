import type { Prisma } from "@prisma/client";
import { ApiRouteError } from "@/lib/api";
import { Status } from "@/lib/api/status";
import { prisma } from "@/lib/prisma";
import { resolveSkuRowForCart } from "@/lib/product-sku-variant";
import { logCommerceEvent } from "./logger";

type Tx = Prisma.TransactionClient;

export type StockLineInput = {
  productId: string;
  productVariantId: string | null;
  variantKey: string | null;
  quantity: number;
};

export function insufficientStockError(): ApiRouteError {
  return new ApiRouteError(
    "Not enough stock for one of the items in your checkout.",
    Status.BAD_REQUEST,
    "INSUFFICIENT_STOCK"
  );
}

async function lockProductRow(tx: Tx, productId: string): Promise<void> {
  await tx.$executeRaw`SELECT id FROM products WHERE id = ${productId} FOR UPDATE`;
}

async function lockVariantRow(tx: Tx, variantId: string): Promise<void> {
  await tx.$executeRaw`SELECT id FROM product_variants WHERE id = ${variantId} FOR UPDATE`;
}

/**
 * Sum ACTIVE unexpired reservations for a product/variant.
 * Caller must hold the product (and variant) row lock — serialization is via product FOR UPDATE.
 */
async function sumActiveReservations(
  tx: Tx,
  productId: string,
  productVariantId: string | null
): Promise<number> {
  const now = new Date();

  if (productVariantId) {
    const rows = await tx.$queryRaw<Array<{ reserved: bigint | number | null }>>`
      SELECT COALESCE(SUM(quantity), 0) AS reserved
      FROM stock_reservations
      WHERE product_id = ${productId}
        AND product_variant_id = ${productVariantId}
        AND status = 'ACTIVE'
        AND expires_at > ${now}
    `;
    return Number(rows[0]?.reserved ?? 0);
  }

  const rows = await tx.$queryRaw<Array<{ reserved: bigint | number | null }>>`
    SELECT COALESCE(SUM(quantity), 0) AS reserved
    FROM stock_reservations
    WHERE product_id = ${productId}
      AND product_variant_id IS NULL
      AND status = 'ACTIVE'
      AND expires_at > ${now}
  `;
  return Number(rows[0]?.reserved ?? 0);
}

/** Final invariant: total ACTIVE reservations must not exceed physical stock. */
async function assertReservationInvariant(
  tx: Tx,
  productId: string,
  productVariantId: string | null,
  physicalStock: number
): Promise<void> {
  const reserved = await sumActiveReservations(tx, productId, productVariantId);
  if (reserved > physicalStock) {
    throw insufficientStockError();
  }
}

/** Acquire row locks for all products/variants in checkout lines (sorted order). */
export async function lockProductsForLines(tx: Tx, lines: StockLineInput[]): Promise<void> {
  for (const line of sortLinesForLocking(lines)) {
    if (line.productVariantId) {
      await lockVariantRow(tx, line.productVariantId);
    }
    await lockProductRow(tx, line.productId);
  }
}

function sortLinesForLocking(lines: StockLineInput[]): StockLineInput[] {
  return [...lines].sort((a, b) => {
    const pk = a.productId.localeCompare(b.productId);
    if (pk !== 0) return pk;
    const ak = a.productVariantId ?? "";
    const bk = b.productVariantId ?? "";
    return ak.localeCompare(bk);
  });
}

type StockTarget = {
  productId: string;
  productVariantId: string | null;
  physicalStock: number;
};

async function resolveStockTarget(tx: Tx, line: StockLineInput): Promise<StockTarget> {
  if (line.productVariantId) {
    await lockVariantRow(tx, line.productVariantId);
    await lockProductRow(tx, line.productId);
    const variant = await tx.productVariant.findFirst({
      where: { id: line.productVariantId, deletedAt: null },
      select: { id: true, stock: true, productId: true },
    });
    if (!variant) {
      throw new ApiRouteError(
        "A selected product option is no longer available.",
        Status.BAD_REQUEST,
        "VARIANT_UNAVAILABLE"
      );
    }
    return {
      productId: line.productId,
      productVariantId: line.productVariantId,
      physicalStock: variant.stock,
    };
  }

  await lockProductRow(tx, line.productId);
  const product = await tx.product.findFirst({
    where: { id: line.productId, deletedAt: null },
    select: { id: true, stock: true },
  });
  if (!product) {
    throw new ApiRouteError(
      "A selected product is no longer available.",
      Status.BAD_REQUEST,
      "PRODUCT_UNAVAILABLE"
    );
  }
  return {
    productId: line.productId,
    productVariantId: null,
    physicalStock: product.stock,
  };
}

/**
 * Reserve stock for checkout session lines inside a transaction.
 * Uses READ COMMITTED (via runCommerceTransaction), product row locks,
 * sorted lock order, and a pre-commit invariant check.
 */
export async function reserveStockForSession(
  tx: Tx,
  checkoutSessionId: string,
  lines: StockLineInput[],
  expiresAt: Date
): Promise<void> {
  const sorted = sortLinesForLocking(lines);
  const checkedTargets = new Set<string>();

  for (const line of sorted) {
    const target = await resolveStockTarget(tx, line);
    const reserved = await sumActiveReservations(
      tx,
      target.productId,
      target.productVariantId
    );
    const available = target.physicalStock - reserved;
    if (available < line.quantity) {
      throw insufficientStockError();
    }

    await tx.stockReservation.create({
      data: {
        checkoutSessionId,
        productId: line.productId,
        productVariantId: line.productVariantId,
        variantKey: line.variantKey,
        quantity: line.quantity,
        status: "ACTIVE",
        expiresAt,
      },
    });

    logCommerceEvent("stock_reserved", {
      checkoutSessionId,
      productId: line.productId,
      quantity: line.quantity,
    });

    const targetKey = `${target.productId}:${target.productVariantId ?? "null"}`;
    if (!checkedTargets.has(targetKey)) {
      checkedTargets.add(targetKey);
      await assertReservationInvariant(
        tx,
        target.productId,
        target.productVariantId,
        target.physicalStock
      );
    }
  }
}

/** Release all active reservations for a checkout session. */
export async function releaseSessionReservations(
  tx: Tx,
  checkoutSessionId: string,
  reason: "expired" | "failed" | "superseded"
): Promise<void> {
  const active = await tx.stockReservation.findMany({
    where: { checkoutSessionId, status: "ACTIVE" },
    select: { productId: true, productVariantId: true },
  });

  const lockKeys = sortLinesForLocking(
    active.map((r) => ({
      productId: r.productId,
      productVariantId: r.productVariantId,
      variantKey: null,
      quantity: 0,
    }))
  );
  for (const line of lockKeys) {
    if (line.productVariantId) {
      await lockVariantRow(tx, line.productVariantId);
    }
    await lockProductRow(tx, line.productId);
  }

  const updated = await tx.stockReservation.updateMany({
    where: { checkoutSessionId, status: "ACTIVE" },
    data: { status: "RELEASED", updatedAt: new Date() },
  });
  if (updated.count > 0) {
    logCommerceEvent("stock_released", { checkoutSessionId, count: updated.count, reason });
  }
}

/** Mark reservations consumed and decrement live stock. */
export async function consumeSessionReservations(
  tx: Tx,
  checkoutSessionId: string
): Promise<number> {
  const reservations = await tx.stockReservation.findMany({
    where: { checkoutSessionId, status: "ACTIVE" },
  });

  for (const res of reservations) {
    if (res.productVariantId) {
      await lockVariantRow(tx, res.productVariantId);
      await tx.productVariant.update({
        where: { id: res.productVariantId },
        data: { stock: { decrement: res.quantity }, updatedAt: new Date() },
      });
    } else {
      await lockProductRow(tx, res.productId);
      await tx.product.update({
        where: { id: res.productId },
        data: { stock: { decrement: res.quantity }, updatedAt: new Date() },
      });
    }

    await tx.stockReservation.update({
      where: { id: res.id },
      data: { status: "CONSUMED", updatedAt: new Date() },
    });

    logCommerceEvent("stock_consumed", {
      checkoutSessionId,
      productId: res.productId,
      quantity: res.quantity,
    });
  }

  return reservations.length;
}

export type ReservationFulfillmentState = "none" | "active" | "consumed" | "released";

/** Whether stock for a session was consumed, still reserved, released, or never reserved. */
export async function reservationFulfillmentState(
  tx: Tx,
  checkoutSessionId: string
): Promise<ReservationFulfillmentState> {
  const rows = await tx.stockReservation.groupBy({
    by: ["status"],
    where: { checkoutSessionId },
    _count: { id: true },
  });
  if (rows.length === 0) return "none";
  const hasActive = rows.some((r) => r.status === "ACTIVE" && r._count.id > 0);
  if (hasActive) return "active";
  const hasConsumed = rows.some((r) => r.status === "CONSUMED" && r._count.id > 0);
  if (hasConsumed) return "consumed";
  return "released";
}

/** Decrement stock from order line items (payment recovery when reservations were released). */
export async function fulfillStockFromOrderItems(tx: Tx, orderId: string): Promise<void> {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      productId: true,
      quantity: true,
      variantSnapshot: true,
    },
  });

  for (const item of items) {
    const variantSnapshot = item.variantSnapshot as { raw?: string } | null;
    const variantKey = variantSnapshot?.raw ?? null;

    const variants = await tx.productVariant.findMany({
      where: { productId: item.productId, deletedAt: null },
      select: { id: true, color: true, size: true, stock: true, price: true },
    });

    if (variants.length > 0) {
      const row = resolveSkuRowForCart(variants, variantKey);
      if (row) {
        await lockVariantRow(tx, row.id);
        await tx.productVariant.update({
          where: { id: row.id },
          data: { stock: { decrement: item.quantity }, updatedAt: new Date() },
        });
        logCommerceEvent("stock_consumed", {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          source: "order_items_fallback",
        });
        continue;
      }
    }

    await lockProductRow(tx, item.productId);
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity }, updatedAt: new Date() },
    });

    logCommerceEvent("stock_consumed", {
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      source: "order_items_fallback",
    });
  }
}

/** Release expired stock reservations (cleanup job). Skips paid / in-flight payments. */
export async function releaseExpiredStockReservations(): Promise<number> {
  const now = new Date();
  const expired = await prisma.stockReservation.findMany({
    where: { status: "ACTIVE", expiresAt: { lte: now } },
    select: { id: true, checkoutSessionId: true },
    take: 500,
  });

  if (expired.length === 0) return 0;

  let released = 0;
  const sessionIds = [...new Set(expired.map((r) => r.checkoutSessionId))];

  await prisma.$transaction(async (tx) => {
    for (const sessionId of sessionIds) {
      const paid = await tx.payment.findFirst({
        where: {
          order: { checkoutSessionId: sessionId },
          status: "PAID",
        },
        select: { id: true },
      });
      if (paid) continue;

      const pendingOrder = await tx.order.findFirst({
        where: { checkoutSessionId: sessionId, status: "PENDING_PAYMENT" },
        select: { id: true },
      });
      if (pendingOrder) {
        const session = await tx.checkoutSession.findUnique({
          where: { id: sessionId },
          select: { expiresAt: true },
        });
        if (session && session.expiresAt > now) continue;
      }

      const sessionReservations = expired.filter((r) => r.checkoutSessionId === sessionId);
      const updated = await tx.stockReservation.updateMany({
        where: {
          id: { in: sessionReservations.map((r) => r.id) },
          status: "ACTIVE",
        },
        data: { status: "RELEASED", updatedAt: now },
      });
      if (updated.count > 0) {
        released += updated.count;
        logCommerceEvent("stock_released", { checkoutSessionId: sessionId, reason: "expired" });
      }
    }
  });

  return released;
}

export function reservationExpiresAt(sessionExpiresAt: Date): Date {
  return new Date(sessionExpiresAt.getTime());
}
