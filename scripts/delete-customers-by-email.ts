/**
 * Hard-delete customer (User) accounts and related rows by email pattern.
 * Targets local parts: agrawallakshya010, lakshyaagrawal010 (any domain).
 *
 * Run: npx tsx scripts/delete-customers-by-email.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Match if email contains any of these substrings (case-insensitive via filter). */
const LOCAL_PART_MARKERS = ["agrawallakshya010", "lakshyaagrawal010"];

function matchesTarget(email: string): boolean {
  const e = email.toLowerCase();
  return LOCAL_PART_MARKERS.some((m) => e.includes(m.toLowerCase()));
}

async function deleteUsersAndRelated(userIds: string[]) {
  if (userIds.length === 0) return;

  const orders = await prisma.order.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  await prisma.$transaction(async (tx) => {
    await tx.supportTicket.deleteMany({ where: { userId: { in: userIds } } });
    await tx.review.deleteMany({ where: { userId: { in: userIds } } });
    await tx.notification.deleteMany({ where: { userId: { in: userIds } } });
    await tx.cartItem.deleteMany({ where: { userId: { in: userIds } } });
    await tx.wishlistItem.deleteMany({ where: { userId: { in: userIds } } });

    await tx.productQuestion.updateMany({
      where: { askedByUserId: { in: userIds } },
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

    await tx.address.deleteMany({ where: { userId: { in: userIds } } });
    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  });
}

async function main() {
  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, email: true },
  });

  const targets = allUsers.filter((u) => matchesTarget(u.email));

  if (targets.length === 0) {
    console.log("No users found matching:", LOCAL_PART_MARKERS.join(", "));
    return;
  }

  console.log(
    "Deleting customer user(s):",
    targets.map((t) => t.email).join(", ")
  );

  await deleteUsersAndRelated(targets.map((t) => t.id));
  console.log("Removed", targets.length, "user account(s). Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
