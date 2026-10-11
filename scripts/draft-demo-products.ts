/**
 * Move demo / old catalog products to DRAFT so customers no longer see them.
 * Storefront only lists status = ACTIVE (and deletedAt null).
 *
 * Matches:
 *   - Seed SKU prefixes: HM-, MB-, BK-, SP-, FA-, BE-
 *   - Optional: ACTIVE products created before --days (default 7)
 *   - Optional: selling price of ₹1 (from the one-time demo price migration)
 *
 * Dry-run:
 *   npx tsx scripts/draft-demo-products.ts
 *   npx tsx scripts/draft-demo-products.ts --days=7
 *
 * Apply:
 *   npx tsx scripts/draft-demo-products.ts --apply
 *
 * Flags:
 *   --days=N          also draft ACTIVE products older than N days (default 7; use --days=0 to skip age filter)
 *   --no-sku          skip seed SKU matching
 *   --no-price-one    skip ₹1 selling-price matching
 *   --apply           write DRAFT status
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_SKU_PREFIXES = ["HM-", "MB-", "BK-", "SP-", "FA-", "BE-"] as const;

function parseArgs(argv: string[]) {
  let days = 7;
  let apply = false;
  let matchSku = true;
  let matchPriceOne = true;
  for (const arg of argv) {
    if (arg === "--apply") apply = true;
    else if (arg === "--no-sku") matchSku = false;
    else if (arg === "--no-price-one") matchPriceOne = false;
    else if (arg.startsWith("--days=")) {
      const n = Number(arg.slice("--days=".length));
      if (!Number.isFinite(n) || n < 0) {
        throw new Error(`Invalid --days value: ${arg}`);
      }
      days = Math.floor(n);
    }
  }
  return { days, apply, matchSku, matchPriceOne };
}

async function main() {
  const { days, apply, matchSku, matchPriceOne } = parseArgs(process.argv.slice(2));
  const cutoff = days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

  const or: Prisma.ProductWhereInput[] = [];
  if (matchSku) {
    for (const prefix of SEED_SKU_PREFIXES) {
      or.push({ sku: { startsWith: prefix } });
    }
  }
  if (matchPriceOne) {
    or.push({ sellingPrice: new Prisma.Decimal(1) });
  }
  if (cutoff) {
    or.push({ createdAt: { lt: cutoff } });
  }

  if (or.length === 0) {
    throw new Error("No match criteria enabled. Remove --no-sku / --no-price-one or set --days>0.");
  }

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: "ACTIVE",
    OR: or,
  };

  const total = await prisma.product.count({ where });
  const stillActive = await prisma.product.count({
    where: { deletedAt: null, status: "ACTIVE", NOT: { OR: or } },
  });

  console.log("Criteria:");
  if (matchSku) console.log(`  - seed SKUs: ${SEED_SKU_PREFIXES.join(", ")}`);
  if (matchPriceOne) console.log("  - selling price = ₹1");
  if (cutoff) console.log(`  - created before ${cutoff.toISOString()} (>${days} days)`);
  console.log(`Would move to DRAFT: ${total}`);
  console.log(`Would remain ACTIVE: ${stillActive}`);

  const sample = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 15,
    select: {
      id: true,
      name: true,
      sku: true,
      createdAt: true,
      sellingPrice: true,
      status: true,
    },
  });
  if (sample.length > 0) {
    console.log("Sample:");
    for (const p of sample) {
      console.log(
        `  - ${p.createdAt.toISOString()} ₹${p.sellingPrice} [${p.sku}] ${p.name}`
      );
    }
  }

  if (!apply) {
    console.log("\nDry-run only. Re-run with --apply to set status = DRAFT.");
    return;
  }

  if (total === 0) {
    console.log("Nothing to update.");
    return;
  }

  const result = await prisma.product.updateMany({
    where,
    data: { status: "DRAFT" },
  });
  console.log(`\nMoved ${result.count} product(s) to DRAFT.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
