/**
 * Soft-delete catalog products created before a cutoff (default: 7 days ago).
 * Storefront already ignores rows with deletedAt set.
 *
 * Dry-run (count + sample only):
 *   npx tsx scripts/soft-delete-products-older-than.ts
 *   npx tsx scripts/soft-delete-products-older-than.ts --days=7
 *
 * Apply soft-delete:
 *   npx tsx scripts/soft-delete-products-older-than.ts --apply
 *   npx tsx scripts/soft-delete-products-older-than.ts --days=7 --apply
 *
 * Uses DATABASE_URL from .env (same as Prisma).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  let days = 7;
  let apply = false;
  for (const arg of argv) {
    if (arg === "--apply") apply = true;
    else if (arg.startsWith("--days=")) {
      const n = Number(arg.slice("--days=".length));
      if (!Number.isFinite(n) || n < 1) {
        throw new Error(`Invalid --days value: ${arg}`);
      }
      days = Math.floor(n);
    }
  }
  return { days, apply };
}

async function main() {
  const { days, apply } = parseArgs(process.argv.slice(2));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where = {
    deletedAt: null,
    createdAt: { lt: cutoff },
  };

  const total = await prisma.product.count({ where });
  const keep = await prisma.product.count({
    where: { deletedAt: null, createdAt: { gte: cutoff } },
  });

  console.log(`Cutoff: products created before ${cutoff.toISOString()} (>${days} days old)`);
  console.log(`Would soft-delete: ${total}`);
  console.log(`Would keep (created in last ${days} days): ${keep}`);

  const sample = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 10,
    select: { id: true, name: true, createdAt: true, status: true },
  });
  if (sample.length > 0) {
    console.log("Sample (oldest matches):");
    for (const p of sample) {
      console.log(`  - ${p.createdAt.toISOString()} [${p.status}] ${p.name}`);
    }
  }

  if (!apply) {
    console.log("\nDry-run only. Re-run with --apply to soft-delete.");
    return;
  }

  if (total === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const now = new Date();
  const result = await prisma.product.updateMany({
    where,
    data: { deletedAt: now },
  });
  console.log(`\nSoft-deleted ${result.count} product(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
