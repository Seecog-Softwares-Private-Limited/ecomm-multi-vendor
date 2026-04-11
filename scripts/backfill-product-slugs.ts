/**
 * scripts/backfill-product-slugs.ts
 *
 * One-time migration: generates SEO-friendly slugs for all products that don't
 * yet have one. Ensures uniqueness by appending -1, -2, ... on conflicts.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json -e "require('./scripts/backfill-product-slugs')"
 *
 * Or (if tsx is available):
 *   npx tsx scripts/backfill-product-slugs.ts
 *
 * Or as an npm script (add to package.json):
 *   "backfill:slugs": "tsx scripts/backfill-product-slugs.ts"
 */

import slugify from "slugify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BATCH_SIZE = 100;

/**
 * Builds a unique slug for `name` without touching the DB for every check.
 * Instead uses an in-memory set of already-assigned slugs and the existing
 * DB slugs loaded at startup.
 */
function makeSlugifier(existingDbSlugs: Set<string>) {
  const taken = new Set<string>(existingDbSlugs);

  return function uniqueSlug(name: string): string {
    const base = slugify(name, { lower: true, strict: true, trim: true });
    if (!taken.has(base)) {
      taken.add(base);
      return base;
    }
    let counter = 1;
    while (true) {
      const candidate = `${base}-${counter}`;
      if (!taken.has(candidate)) {
        taken.add(candidate);
        return candidate;
      }
      counter++;
    }
  };
}

async function main() {
  console.log("Starting product slug backfill…\n");

  // Load all existing non-null slugs to avoid conflicts with already-slugged products.
  const slugged = await prisma.product.findMany({
    where: { slug: { not: null } },
    select: { id: true, slug: true },
  });
  const existingDbSlugs = new Set<string>(slugged.map((p) => p.slug as string));
  console.log(`  ${existingDbSlugs.size} products already have slugs.`);

  // Fetch products without a slug.
  const unsluggedTotal = await prisma.product.count({ where: { slug: null } });
  console.log(`  ${unsluggedTotal} products need a slug.\n`);

  if (unsluggedTotal === 0) {
    console.log("Nothing to do. All products already have slugs.");
    return;
  }

  const getUniqueSlug = makeSlugifier(existingDbSlugs);

  let processed = 0;

  // Always query the first BATCH_SIZE products without a slug.
  // As products get slugged they fall out of the where clause, so
  // `skip: 0` naturally advances to the next un-slugged batch.
  while (true) {
    const batch = await prisma.product.findMany({
      where: { slug: null },
      select: { id: true, name: true },
      take: BATCH_SIZE,
      orderBy: { createdAt: "asc" },
    });

    if (batch.length === 0) break;

    // Build updates: generate a unique slug per product in this batch.
    const updates = batch.map((p) => ({
      id: p.id,
      slug: getUniqueSlug(p.name),
    }));

    // Write in a single transaction for atomicity.
    await prisma.$transaction(
      updates.map(({ id, slug }) =>
        prisma.product.update({ where: { id }, data: { slug } })
      )
    );

    processed += batch.length;
    console.log(`  ✓ Processed ${processed} / ${unsluggedTotal}`);

    if (batch.length < BATCH_SIZE) break;
  }

  console.log(`\nDone! ${processed} products slugged.`);
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
