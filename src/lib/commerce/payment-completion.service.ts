import type { OrderStatus, Prisma } from "@prisma/client";
import { ApiRouteError } from "@/lib/api";
import { Status } from "@/lib/api/status";
import { prisma } from "@/lib/prisma";
import { transitionCheckoutSession } from "./checkout-session-lifecycle";
import { invalidateCartCache, invalidateCheckoutCache } from "./cache";
import { logCommerceEvent } from "./logger";
import { assertOrderTransition } from "./order-state-machine";
import {
  consumeSessionReservations,
  fulfillStockFromOrderItems,
  reservationFulfillmentState,
} from "./stock-reservation";

type Tx = Prisma.TransactionClient;

export type ConfirmRazorpayPaymentInput = {
  /** Our internal order id (verify endpoint). */
  orderId?: string;
  /** Razorpay order id (webhook). */
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  /** When set, order must belong to this user (client verify). */
  userId?: string | null;
  idempotencyKey?: string | null;
  source: "verify" | "webhook";
};

export type ConfirmRazorpayPaymentResult = {
  orderId: string;
  verified: boolean;
  recovered: boolean;
};

async function clearConsumedCartItems(
  tx: Tx,
  userId: string,
  cartItemIds: string[]
): Promise<void> {
  if (cartItemIds.length === 0) return;
  const now = new Date();
  await tx.cartItem.updateMany({
    where: { id: { in: cartItemIds }, userId, deletedAt: null },
    data: { deletedAt: now, updatedAt: now },
  });
}

async function lockOrderRow(tx: Tx, orderId: string): Promise<void> {
  await tx.$executeRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
}

async function lockPaymentRow(tx: Tx, paymentId: string): Promise<void> {
  await tx.$executeRaw`SELECT id FROM payments WHERE id = ${paymentId} FOR UPDATE`;
}

async function fulfillPaidOrderStock(
  tx: Tx,
  checkoutSessionId: string | null,
  orderId: string
): Promise<void> {
  if (!checkoutSessionId) {
    await fulfillStockFromOrderItems(tx, orderId);
    return;
  }

  const state = await reservationFulfillmentState(tx, checkoutSessionId);
  if (state === "consumed") return;
  if (state === "active") {
    await consumeSessionReservations(tx, checkoutSessionId);
    return;
  }
  // Reservations released (cleanup race) — still honor payment by fulfilling from order lines.
  await fulfillStockFromOrderItems(tx, orderId);
}

function resolveOrderStatusAfterPayment(current: OrderStatus): OrderStatus {
  if (current === "PENDING_PAYMENT") return "PAYMENT_CONFIRMED";
  if (current === "CANCELLED") return "PAYMENT_CONFIRMED";
  return current;
}

function paymentConfirmedNote(source: "verify" | "webhook", recovered: boolean): string {
  if (recovered) return "Payment confirmed (recovered after expiry race)";
  return source === "webhook"
    ? "Payment received via Razorpay webhook"
    : "Payment received via Razorpay";
}

/**
 * Idempotent Razorpay payment confirmation shared by /payments/verify and webhook.
 * Uses row locks + conditional payment update to prevent duplicate processing.
 */
export async function confirmRazorpayPayment(
  input: ConfirmRazorpayPaymentInput
): Promise<ConfirmRazorpayPaymentResult> {
  const razorpayPaymentId = input.razorpayPaymentId.trim();
  const razorpayOrderId = input.razorpayOrderId?.trim() || null;
  const orderIdInput = input.orderId?.trim() || null;

  if (!razorpayPaymentId) {
    throw new ApiRouteError("razorpayPaymentId is required.", Status.BAD_REQUEST, "INVALID_PAYMENT");
  }

  const paymentRow = await prisma.payment.findFirst({
    where: {
      ...(orderIdInput ? { orderId: orderIdInput } : {}),
      ...(razorpayOrderId ? { razorpayOrderId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          checkoutSession: {
            select: { id: true, lines: { select: { cartItemId: true } } },
          },
        },
      },
    },
  });

  if (!paymentRow) {
    throw new ApiRouteError("Payment not found for this order.", Status.NOT_FOUND, "PAYMENT_NOT_FOUND");
  }

  if (input.userId && paymentRow.order.userId !== input.userId) {
    throw new ApiRouteError("Order not found.", Status.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  const order = paymentRow.order;
  const payment = paymentRow;

  if (payment.status === "PAID") {
    logCommerceEvent("payment_verified", {
      orderId: order.id,
      userId: order.userId,
      recovered: true,
      source: input.source,
    });
    return { orderId: order.id, verified: true, recovered: true };
  }

  const consumedCartItemIds: string[] = Array.isArray(order.consumedCartItemIds)
    ? (order.consumedCartItemIds as string[])
    : (order.checkoutSession?.lines
        .map((l) => l.cartItemId)
        .filter((id): id is string => id != null) ?? []);

  const paid = await prisma.$transaction(async (tx) => {
    await lockPaymentRow(tx, payment.id);
    await lockOrderRow(tx, order.id);

    const freshPayment = await tx.payment.findUnique({
      where: { id: payment.id },
      select: { status: true, idempotencyKey: true },
    });
    if (!freshPayment) return false;
    if (freshPayment.status === "PAID") return false;

    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status: "PAID",
        transactionId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId ?? payment.razorpayOrderId,
        paidAt: new Date(),
        updatedAt: new Date(),
        idempotencyKey:
          input.idempotencyKey?.trim() ||
          freshPayment.idempotencyKey ||
          `razorpay:${razorpayPaymentId}`,
      },
    });

    if (updated.count === 0) {
      const current = await tx.payment.findUnique({
        where: { id: payment.id },
        select: { status: true },
      });
      return current?.status === "PAID";
    }

    const freshOrder = await tx.order.findUnique({
      where: { id: order.id },
      select: { status: true, couponId: true, checkoutSessionId: true, userId: true },
    });
    if (!freshOrder) return false;

    const targetStatus = resolveOrderStatusAfterPayment(freshOrder.status);
    const recoveredFromCancel = freshOrder.status === "CANCELLED";
    const shouldConfirmOrder = freshOrder.status !== "PAYMENT_CONFIRMED";

    if (shouldConfirmOrder) {
      if (freshOrder.status === "PENDING_PAYMENT") {
        assertOrderTransition(freshOrder.status, "PAYMENT_CONFIRMED");
      } else if (freshOrder.status !== "CANCELLED") {
        throw new ApiRouteError(
          `Cannot confirm payment while order is ${freshOrder.status}.`,
          Status.CONFLICT,
          "INVALID_ORDER_STATE"
        );
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: targetStatus, updatedAt: new Date() },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: "PAYMENT_CONFIRMED",
          note: paymentConfirmedNote(input.source, recoveredFromCancel),
        },
      });
    }

    const shouldIncrementCoupon =
      !!freshOrder.couponId &&
      shouldConfirmOrder &&
      (freshOrder.status === "PENDING_PAYMENT" || freshOrder.status === "CANCELLED");

    if (freshOrder.checkoutSessionId) {
      await fulfillPaidOrderStock(tx, freshOrder.checkoutSessionId, order.id);
      await transitionCheckoutSession(tx, freshOrder.checkoutSessionId, "COMPLETED", "completed");
    } else {
      await fulfillStockFromOrderItems(tx, order.id);
    }

    if (consumedCartItemIds.length > 0) {
      await clearConsumedCartItems(tx, freshOrder.userId, consumedCartItemIds);
    }

    if (shouldIncrementCoupon && freshOrder.couponId) {
      await tx.coupon.update({
        where: { id: freshOrder.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return true;
  });

  if (!paid) {
    logCommerceEvent("payment_verified", {
      orderId: order.id,
      userId: order.userId,
      recovered: true,
      source: input.source,
    });
    return { orderId: order.id, verified: true, recovered: true };
  }

  invalidateCartCache(order.userId);
  if (order.checkoutSessionId) {
    invalidateCheckoutCache(order.checkoutSessionId);
  }

  logCommerceEvent("payment_verified", {
    orderId: order.id,
    userId: order.userId,
    source: input.source,
  });

  return { orderId: order.id, verified: true, recovered: false };
}

/** Lookup internal order id by Razorpay order id (webhook helper). */
export async function findOrderIdByRazorpayOrderId(
  razorpayOrderId: string
): Promise<string | null> {
  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: razorpayOrderId.trim() },
    select: { orderId: true },
    orderBy: { createdAt: "desc" },
  });
  return payment?.orderId ?? null;
}
