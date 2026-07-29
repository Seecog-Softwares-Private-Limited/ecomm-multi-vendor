import type { CheckoutSessionStatus, Prisma } from "@prisma/client";
import { releaseSessionReservations } from "./stock-reservation";
import { invalidateCheckoutCache } from "./cache";
import { logCommerceEvent } from "./logger";

type Tx = Prisma.TransactionClient;

const RELEASE_RESERVATION_STATUSES: CheckoutSessionStatus[] = [
  "FAILED",
  "EXPIRED",
  "CANCELLED",
];

/**
 * Transition checkout session and immediately release ACTIVE stock reservations when terminal.
 */
export async function transitionCheckoutSession(
  tx: Tx,
  checkoutSessionId: string,
  toStatus: CheckoutSessionStatus,
  reason: "expired" | "failed" | "superseded" | "cancelled" | "completed"
): Promise<void> {
  if (RELEASE_RESERVATION_STATUSES.includes(toStatus)) {
    await releaseSessionReservations(
      tx,
      checkoutSessionId,
      toStatus === "EXPIRED" ? "expired" : toStatus === "CANCELLED" ? "failed" : "failed"
    );
  }

  await tx.checkoutSession.update({
    where: { id: checkoutSessionId },
    data: { status: toStatus, updatedAt: new Date() },
  });

  logCommerceEvent(
    toStatus === "EXPIRED"
      ? "checkout_session_expired"
      : toStatus === "FAILED"
        ? "order_failed"
        : "checkout_session_created",
    { checkoutSessionId, toStatus, reason }
  );
}

/** Release reservations + mark session FAILED (outside or inside transaction). */
export async function failCheckoutSessionWithRelease(
  checkoutSessionId: string,
  tx?: Tx
): Promise<void> {
  const run = async (client: Tx) => {
    await transitionCheckoutSession(client, checkoutSessionId, "FAILED", "failed");
  };
  if (tx) {
    await run(tx);
  } else {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$transaction(run);
  }
  invalidateCheckoutCache(checkoutSessionId);
}
