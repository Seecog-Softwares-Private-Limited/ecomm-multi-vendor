import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone } from "@/lib/auth/phone";

/**
 * Permanently removes a customer user and all related personal data.
 * Orders must be deleted first (User → Order is onDelete: Restrict).
 */
export async function hardDeleteCustomerAccount(
  userId: string,
  existingTx?: Prisma.TransactionClient
): Promise<boolean> {
  const run = async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, phone: true },
    });
    if (!user) return false;

    const orders = await tx.order.findMany({
      where: { userId },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    await tx.supportTicket.deleteMany({ where: { userId } });
    await tx.review.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.cartItem.deleteMany({ where: { userId } });
    await tx.wishlistItem.deleteMany({ where: { userId } });

    await tx.productQuestion.updateMany({
      where: { askedByUserId: userId },
      data: { askedByUserId: null },
    });

    if (orderIds.length > 0) {
      const returnRows = await tx.return.findMany({
        where: { orderId: { in: orderIds } },
        select: { id: true },
      });
      const returnIds = returnRows.map((r) => r.id);
      if (returnIds.length > 0) {
        await tx.returnItem.deleteMany({ where: { returnId: { in: returnIds } } });
      }
      await tx.return.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.orderStatusEvent.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    if (user.phone) {
      const phoneNorm = normalizeIndianPhone(user.phone);
      if (phoneNorm) {
        await tx.customerPhoneOtp.deleteMany({ where: { phoneNorm } });
      }
    }

    await tx.address.deleteMany({ where: { userId } });
    await tx.user.deleteMany({ where: { id: userId } });
    return true;
  };

  if (existingTx) return run(existingTx);
  return prisma.$transaction(run);
}
