import { NextRequest, NextResponse } from "next/server";
import { apiBadRequest, withApiHandler } from "@/lib/api";
import { confirmRazorpayPayment } from "@/lib/commerce/payment-completion.service";
import { logCommerceEvent } from "@/lib/commerce/logger";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
};

const CONFIRMATION_EVENT = "payment.captured";

/**
 * POST /api/payments/razorpay/webhook — Razorpay server-to-server payment confirmation.
 * Only `payment.captured` confirms orders; `payment.authorized` is acknowledged but ignored.
 * Configure webhook URL in Razorpay dashboard; set RAZORPAY_WEBHOOK_SECRET in env.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature")?.trim() ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    logCommerceEvent("order_failed", { stage: "webhook_signature" });
    return apiBadRequest("Invalid webhook signature.");
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return apiBadRequest("Invalid webhook JSON.");
  }

  const event = payload.event ?? "";

  if (event === "payment.authorized") {
    return NextResponse.json({
      received: true,
      ignored: true,
      event,
      reason: "Only payment.captured confirms orders.",
    });
  }

  if (event !== CONFIRMATION_EVENT) {
    return NextResponse.json({ received: true, ignored: true, event });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const razorpayPaymentId = paymentEntity?.id?.trim() ?? "";
  const razorpayOrderId = paymentEntity?.order_id?.trim() ?? "";

  if (!razorpayPaymentId || !razorpayOrderId) {
    return apiBadRequest("Webhook payload missing payment id or order id.");
  }

  if (paymentEntity?.status && paymentEntity.status !== "captured") {
    return NextResponse.json({ received: true, ignored: true, status: paymentEntity.status });
  }

  logCommerceEvent("payment_started", {
    razorpayOrderId,
    razorpayPaymentId,
    source: "webhook",
    event,
  });

  const result = await confirmRazorpayPayment({
    razorpayOrderId,
    razorpayPaymentId,
    idempotencyKey: `webhook:${razorpayPaymentId}`,
    source: "webhook",
  });

  return NextResponse.json({
    received: true,
    orderId: result.orderId,
    verified: result.verified,
    recovered: result.recovered,
  });
});
