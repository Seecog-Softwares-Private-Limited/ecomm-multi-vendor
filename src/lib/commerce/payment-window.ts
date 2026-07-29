import type { Prisma } from "@prisma/client";
import { PENDING_PAYMENT_WINDOW_MS } from "./constants";

type Tx = Prisma.TransactionClient;

/**
 * Extend checkout session + stock reservation TTL while customer completes online payment.
 * Called when a PENDING_PAYMENT order is created or Razorpay checkout opens.
 */
export async function extendPaymentWindowForSession(
  tx: Tx,
  checkoutSessionId: string
): Promise<Date> {
  const paymentExpiresAt = new Date(Date.now() + PENDING_PAYMENT_WINDOW_MS);
  await tx.checkoutSession.update({
    where: { id: checkoutSessionId },
    data: { expiresAt: paymentExpiresAt, updatedAt: new Date() },
  });
  await tx.stockReservation.updateMany({
    where: { checkoutSessionId, status: "ACTIVE" },
    data: { expiresAt: paymentExpiresAt, updatedAt: new Date() },
  });
  return paymentExpiresAt;
}
