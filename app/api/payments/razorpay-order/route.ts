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
import { getRazorpay } from "@/lib/razorpay";

/**
 * POST /api/payments/razorpay-order — create a Razorpay order for an existing order (card/UPI).
 * Body: { orderId: string }
 * Returns { razorpayOrderId, amount, currency, keyId } for use in Razorpay Checkout.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can pay for orders.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const orderId =
    typeof body === "object" && body !== null && "orderId" in body
      ? String((body as { orderId: unknown }).orderId)
      : "";
  if (!orderId.trim()) return apiBadRequest("orderId is required.");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.sub },
    include: {
      user: { select: { email: true } },
      shippingAddress: { select: { phone: true } },
      payments: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!order) return apiNotFound("Order not found.");
  const payment = order.payments[0];
  const customerEmail = order.user?.email?.trim() ?? "";
  const customerPhone = order.shippingAddress?.phone?.trim() ?? "";
  if (!payment) return apiBadRequest("No pending payment for this order.");

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return apiSuccess({
      configured: false,
      orderId: order.id,
      message: "Razorpay is not configured. Order is confirmed; add Razorpay keys to .env to enable card/UPI payments.",
    });
  }

  const amountPaise = Math.round(Number(order.totalAmount) * 100);
  if (amountPaise < 100) return apiBadRequest("Order amount too small for Razorpay (min ₹1).");

  let razorpayOrder: { id: string };
  try {
    const rz = getRazorpay();
    razorpayOrder = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: orderId.slice(0, 40),
      notes: { orderId },
    });
  } catch (err) {
    console.error("Razorpay order create error:", err);
    return apiBadRequest("Could not create payment session. Please try again.");
  }

  return apiSuccess({
    configured: true,
    razorpayOrderId: razorpayOrder.id,
    amount: amountPaise,
    currency: "INR",
    keyId,
    orderId: order.id,
    customerEmail,
    customerPhone,
  });
});
