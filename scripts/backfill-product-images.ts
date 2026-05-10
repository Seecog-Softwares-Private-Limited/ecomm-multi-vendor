/**
 * Ensures every non-deleted product has at least one ProductImage row with a valid URL.
 * Uses the same placeholder as the storefront (`/images/product-placeholder.svg`).
 *
 * Run: npm run backfill:product-images
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_URL = "/images/product-placeholder.svg";

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      images: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true },
      },
    },
  });

  let created = 0;
  let fixedEmptyUrl = 0;

  for (const p of products) {
    if (p.images.length === 0) {
      await prisma.productImage.create({
        data: { productId: p.id, url: PLACEHOLDER_URL, sortOrder: 0 },
      });
      created++;
      continue;
    }
    const first = p.images[0]!;
    if (!first.url?.trim()) {
      await prisma.productImage.update({
        where: { id: first.id },
        data: { url: PLACEHOLDER_URL },
      });
      fixedEmptyUrl++;
    }
  }

  console.log(
    `[backfill-product-images] Created ${created} placeholder rows; fixed ${fixedEmptyUrl} empty URLs.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
