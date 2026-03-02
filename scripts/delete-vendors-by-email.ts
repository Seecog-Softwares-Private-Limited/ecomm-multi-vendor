/**
 * One-off script: delete vendor (seller) and user accounts by email so they can re-register.
 * Run: npx tsx scripts/delete-vendors-by-email.ts
 */
import { PrismaClient } from "@prisma/client";

const EMAILS = [
  "lakshyaagrawal010@gmail.com",
  "agrawallakshya010@gmail.com",
  "lakshya@seecogsoftwares.com",
];

async function main() {
  const prisma = new PrismaClient();

  const sellers = await prisma.seller.findMany({
    where: { email: { in: EMAILS }, deletedAt: null },
    select: { id: true, email: true },
  });

  const sellerIds = sellers.map((s) => s.id);

  if (sellers.length > 0) {
    console.log("Deleting vendors:", sellers.map((s) => s.email).join(", "));

    const productIds = await prisma.product
      .findMany({
        where: { sellerId: { in: sellerIds } },
        select: { id: true },
      })
      .then((rows) => rows.map((p) => p.id));

    await prisma.$transaction(async (tx) => {
      if (productIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productImage.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productSpecification.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productVariation.deleteMany({ where: { productId: { in: productIds } } });
        await tx.product.deleteMany({ where: { id: { in: productIds } } });
      }
      await tx.orderItem.deleteMany({ where: { sellerId: { in: sellerIds } } });
      const returnIds = await tx.return
        .findMany({
          where: { sellerId: { in: sellerIds } },
          select: { id: true },
        })
        .then((r) => r.map((x) => x.id));
      if (returnIds.length > 0) {
        await tx.returnItem.deleteMany({ where: { returnId: { in: returnIds } } });
        await tx.return.deleteMany({ where: { id: { in: returnIds } } });
      }
      await tx.settlement.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.payout.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.notification.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.kYCDocument.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.bankAccount.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.vendorDocument.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.vendorSupportTicket.deleteMany({ where: { sellerId: { in: sellerIds } } });
      await tx.seller.deleteMany({ where: { id: { in: sellerIds } } });
    });
    console.log("Removed", sellers.length, "vendor(s).");
  } else {
    console.log("No vendors found with those emails.");
  }

  const users = await prisma.user.findMany({
    where: { email: { in: EMAILS } },
    select: { id: true, email: true },
  });

  if (users.length > 0) {
    console.log("Deleting user accounts:", users.map((u) => u.email).join(", "));
    const userIds = users.map((u) => u.id);
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: { in: userIds } } });
      await tx.wishlistItem.deleteMany({ where: { userId: { in: userIds } } });
      await tx.notification.deleteMany({ where: { userId: { in: userIds } } });
      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    });
    console.log("Removed", users.length, "user(s).");
  } else {
    console.log("No user accounts found with those emails.");
  }

  console.log("Done. You can now re-use these emails for registration.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
