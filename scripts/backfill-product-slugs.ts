/**
 * scripts/backfill-product-slugs.ts
 *
 * One-time migration: generates SEO-friendly slugs for all products that don't
 * yet have one. Ensures uniqueness by appending -1, -2, ... on conflicts.
 *
 * Run on the server (no `slugify` npm package required):
 *   npm run backfill:slugs
 *
 * Requires: DATABASE_URL, `npx prisma generate` already run, `@prisma/client` in node_modules.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BATCH_SIZE = 100;

/**
 * Same intent as `slugify(name, { lower: true, strict: true, trim: true })`
 * so this script runs on servers where `slugify` is not installed in node_modules.
 */
function slugFromName(name: string): string {
  let s = name.trim().toLowerCase();
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  s = s.slice(0, 200);
  return s || "product";
}

/**
 * Builds a unique slug for `name` without touching the DB for every check.
 * Instead uses an in-memory set of already-assigned slugs and the existing
 * DB slugs loaded at startup.
 */
function makeSlugifier(existingDbSlugs: Set<string>) {
  const taken = new Set<string>(existingDbSlugs);

  return function uniqueSlug(name: string): string {
    const base = slugFromName(name);
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
