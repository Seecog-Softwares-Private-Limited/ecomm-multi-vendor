import { prisma } from "@/lib/prisma";
import { logCommerceEvent } from "./logger";
import { transitionCheckoutSession } from "./checkout-session-lifecycle";
import { invalidateCheckoutCache } from "./cache";

/**
 * Expire checkout sessions past TTL; release reservations; cancel unpaid orders.

 * Race-safe: never cancels paid orders or releases stock during active payment verification.

 */

export async function expireCheckoutSessions(): Promise<number> {

  const now = new Date();

  const candidates = await prisma.checkoutSession.findMany({

    where: {

      status: { in: ["ACTIVE", "CHECKING_OUT"] },

      expiresAt: { lte: now },

    },

    select: { id: true, userId: true, status: true },

    take: 200,

  });



  if (candidates.length === 0) return 0;



  let expiredCount = 0;



  for (const candidate of candidates) {

    const didExpire = await prisma.$transaction(async (tx) => {

      await tx.$executeRaw`SELECT id FROM checkout_sessions WHERE id = ${candidate.id} FOR UPDATE`;



      const session = await tx.checkoutSession.findUnique({

        where: { id: candidate.id },

        select: {

          id: true,

          userId: true,

          status: true,

          expiresAt: true,

          order: {

            select: {

              id: true,

              status: true,

              payments: { select: { id: true, status: true }, orderBy: { createdAt: "desc" } },

            },

          },

        },

      });



      if (!session) return false;

      if (!["ACTIVE", "CHECKING_OUT"].includes(session.status)) return false;

      if (session.expiresAt > now) return false;



      const order = session.order;

      const hasPaidPayment = order?.payments.some((p) => p.status === "PAID") ?? false;



      if (hasPaidPayment) {

        await transitionCheckoutSession(tx, session.id, "COMPLETED", "completed");

        return true;

      }



      if (order?.status === "PAYMENT_CONFIRMED" || order?.status === "PROCESSING") {

        await transitionCheckoutSession(tx, session.id, "COMPLETED", "completed");

        return true;

      }



      if (order?.status === "PENDING_PAYMENT") {

        await tx.$executeRaw`SELECT id FROM orders WHERE id = ${order.id} FOR UPDATE`;



        const cancelled = await tx.order.updateMany({

          where: { id: order.id, status: "PENDING_PAYMENT" },

          data: { status: "CANCELLED", updatedAt: now },

        });



        if (cancelled.count === 0) {

          const fresh = await tx.order.findUnique({

            where: { id: order.id },

            select: { status: true, payments: { select: { status: true } } },

          });

          const paid = fresh?.payments.some((p) => p.status === "PAID");

          if (paid || fresh?.status === "PAYMENT_CONFIRMED") {

            await transitionCheckoutSession(tx, session.id, "COMPLETED", "completed");

            return true;

          }

          return false;

        }



        await tx.orderStatusEvent.create({

          data: {

            orderId: order.id,

            status: "CANCELLED",

            note: "Payment window expired",

          },

        });

      }



      await transitionCheckoutSession(tx, session.id, "EXPIRED", "expired");

      return true;

    });



    if (didExpire) {

      expiredCount += 1;

      logCommerceEvent("checkout_session_expired", {

        checkoutSessionId: candidate.id,

        userId: candidate.userId,

      });

      invalidateCheckoutCache(candidate.id);

    }

  }



  return expiredCount;

}



export async function runCommerceCleanup(): Promise<{ sessions: number; stock: number }> {

  const { releaseExpiredStockReservations } = await import("./stock-reservation");

  const sessions = await expireCheckoutSessions();

  const stock = await releaseExpiredStockReservations();

  return { sessions, stock };

}

