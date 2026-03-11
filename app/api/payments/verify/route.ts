import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

/**
 * POST /api/payments/verify — verify Razorpay payment and mark order payment as paid.
 * Body: { orderId: string, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can verify payments.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const orderId = typeof b.orderId === "string" ? b.orderId.trim() : "";
  const razorpayPaymentId = typeof b.razorpayPaymentId === "string" ? b.razorpayPaymentId.trim() : "";
  const razorpayOrderId = typeof b.razorpayOrderId === "string" ? b.razorpayOrderId.trim() : "";
  const razorpaySignature = typeof b.razorpaySignature === "string" ? b.razorpaySignature.trim() : "";

  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return apiBadRequest("orderId, razorpayPaymentId, razorpayOrderId and razorpaySignature are required.");
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.sub },
    include: {
      payments: { where: { status: "PENDING" }, take: 1 },
      items: { select: { productId: true, quantity: true } },
    },
  });
  if (!order) return apiNotFound("Order not found.");
  const payment = order.payments[0];
  if (!payment) return apiBadRequest("No pending payment for this order.");

  const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) return apiBadRequest("Payment verification failed.");

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        transactionId: razorpayPaymentId,
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await tx.orderStatusEvent.create({
      data: { orderId: order.id, status: "PAYMENT_CONFIRMED", note: "Payment received via Razorpay" },
    });
    // Clear cart items that were part of this order (only after payment confirmed)
    for (const orderItem of order.items) {
      let remaining = orderItem.quantity;
      while (remaining > 0) {
        const cartRow = await tx.cartItem.findFirst({
          where: { userId: session.sub, productId: orderItem.productId, deletedAt: null },
          orderBy: { createdAt: "asc" },
        });
        if (!cartRow) break;
        const toRemove = Math.min(cartRow.quantity, remaining);
        remaining -= toRemove;
        if (toRemove >= cartRow.quantity) {
          await tx.cartItem.update({
            where: { id: cartRow.id },
            data: { deletedAt: new Date(), updatedAt: new Date() },
          });
        } else {
          await tx.cartItem.update({
            where: { id: cartRow.id },
            data: { quantity: cartRow.quantity - toRemove, updatedAt: new Date() },
          });
        }
      }
    }
  });

  return apiSuccess({
    verified: true,
    orderId: order.id,
    message: "Payment successful",
  });
});
