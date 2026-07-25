/**
 * Idempotently upsert marketplace categories + subcategories.
 * Run: npm run db:categories
 */
import { PrismaClient } from "@prisma/client";
import { MARKETPLACE_CATEGORIES } from "../src/lib/constants/marketplace-categories";

const prisma = new PrismaClient();

async function main() {
  let categoryCount = 0;
  let subCategoryCount = 0;

  for (const cat of MARKETPLACE_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder, deletedAt: null },
      create: { slug: cat.slug, name: cat.name, sortOrder: cat.sortOrder },
    });
    categoryCount += 1;

    for (let i = 0; i < cat.subCategories.length; i++) {
      const sub = cat.subCategories[i];
      await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        update: { name: sub.name, sortOrder: sub.sortOrder ?? i, deletedAt: null },
        create: {
          categoryId: category.id,
          slug: sub.slug,
          name: sub.name,
          sortOrder: sub.sortOrder ?? i,
        },
      });
      subCategoryCount += 1;
    }
  }

  console.log(`Upserted ${categoryCount} categories and ${subCategoryCount} subcategories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
