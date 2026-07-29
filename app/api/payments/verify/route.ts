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
import { completeOrderAfterPayment } from "@/lib/commerce/order-placement.service";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { logCommerceEvent } from "@/lib/commerce/logger";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/payments/verify — verify Razorpay payment (idempotent).
 * Body: { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, idempotencyKey? }
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
  const razorpayPaymentId =
    typeof b.razorpayPaymentId === "string" ? b.razorpayPaymentId.trim() : "";
  const razorpayOrderId =
    typeof b.razorpayOrderId === "string" ? b.razorpayOrderId.trim() : "";
  const razorpaySignature =
    typeof b.razorpaySignature === "string" ? b.razorpaySignature.trim() : "";
  const idempotencyKey =
    typeof b.idempotencyKey === "string"
      ? b.idempotencyKey.trim()
      : request.headers.get("Idempotency-Key")?.trim() || null;

  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return apiBadRequest(
      "orderId, razorpayPaymentId, razorpayOrderId and razorpaySignature are required."
    );
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.sub },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return apiNotFound("Order not found.");

  const payment = order.payments[0];
  if (!payment) return apiBadRequest("No payment record for this order.");

  if (payment.status === "PAID") {
    return apiSuccess({
      verified: true,
      orderId: order.id,
      recovered: true,
      message: "Payment already confirmed.",
    });
  }

  const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    logCommerceEvent("order_failed", { orderId, userId: session.sub, stage: "verify_signature" });
    const { notifyPaymentFailed } = await import("@/lib/notifications/customer-notifications");
    void notifyPaymentFailed(session.sub, orderId).catch(() => undefined);
    return apiBadRequest("Payment verification failed. Please contact support if amount was deducted.");
  }

  logCommerceEvent("payment_started", { orderId, userId: session.sub });

  const result = await completeOrderAfterPayment(
    orderId,
    session.sub,
    razorpayPaymentId,
    razorpayOrderId,
    idempotencyKey
  );

  return apiSuccess({
    verified: result.verified,
    orderId: result.orderId,
    recovered: result.recovered,
    message: result.recovered ? "Payment already confirmed." : "Payment successful",
  });
});

/**
 * GET /api/payments/verify?orderId= — payment recovery (check if order already paid).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can check payment status.");

  const orderId = request.nextUrl.searchParams.get("orderId")?.trim() ?? "";
  if (!orderId) return apiBadRequest("orderId query parameter is required.");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.sub },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      checkoutSession: { select: { id: true, status: true } },
    },
  });
  if (!order) return apiNotFound("Order not found.");

  const payment = order.payments[0];
  const paid = payment?.status === "PAID";

  return apiSuccess({
    orderId: order.id,
    orderStatus: order.status,
    paymentStatus: payment?.status ?? null,
    paid,
    checkoutSessionId: order.checkoutSession?.id ?? null,
    checkoutSessionStatus: order.checkoutSession?.status ?? null,
    message: paid
      ? "Payment confirmed. Your order is complete."
      : "Payment is still pending for this order.",
  });
});
