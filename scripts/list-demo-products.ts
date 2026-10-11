/**
 * List demo / old catalog products with createdAt and seller.
 *
 *   npx tsx scripts/list-demo-products.ts
 *   npx tsx scripts/list-demo-products.ts --csv > demo-products.csv
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SEED_SKU_PREFIXES = ["HM-", "MB-", "BK-", "SP-", "FA-", "BE-"] as const;

async function main() {
  const asCsv = process.argv.includes("--csv");
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const or: Prisma.ProductWhereInput[] = [
    ...SEED_SKU_PREFIXES.map((p) => ({ sku: { startsWith: p } })),
    { sellingPrice: new Prisma.Decimal(1) },
    { createdAt: { lt: cutoff } },
  ];

  const rows = await prisma.product.findMany({
    where: { deletedAt: null, OR: or },
    orderBy: { createdAt: "asc" },
    select: {
      name: true,
      sku: true,
      status: true,
      sellingPrice: true,
      createdAt: true,
      seller: {
        select: {
          businessName: true,
          ownerName: true,
          email: true,
        },
      },
    },
  });

  if (asCsv) {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    console.log(
      ["name", "sku", "status", "price", "createdAt", "addedBy", "sellerEmail"].join(",")
    );
    for (const p of rows) {
      const addedBy =
        p.seller.businessName || p.seller.ownerName || p.seller.email || "";
      console.log(
        [
          esc(p.name),
          esc(p.sku),
          p.status,
          String(p.sellingPrice),
          p.createdAt.toISOString(),
          esc(addedBy),
          esc(p.seller.email),
        ].join(",")
      );
    }
    return;
  }

  console.log(`Demo / old products: ${rows.length}\n`);
  console.log(
    `${"#".padStart(4)}  ${"Created At".padEnd(22)}  ${"Status".padEnd(16)}  ${"Price".padStart(8)}  ${"SKU".padEnd(16)}  ${"Added by".padEnd(28)}  Name`
  );
  console.log("-".repeat(140));
  rows.forEach((p, i) => {
    const addedBy = (
      p.seller.businessName ||
      p.seller.ownerName ||
      p.seller.email ||
      "—"
    ).slice(0, 28);
    console.log(
      `${String(i + 1).padStart(4)}  ${p.createdAt.toISOString().padEnd(22)}  ${p.status.padEnd(16)}  ${("₹" + p.sellingPrice).padStart(8)}  ${p.sku.padEnd(16)}  ${addedBy.padEnd(28)}  ${p.name}`
    );
  });

  const bySeller = new Map<string, number>();
  for (const p of rows) {
    const key = `${p.seller.businessName || p.seller.ownerName || "—"} <${p.seller.email}>`;
    bySeller.set(key, (bySeller.get(key) ?? 0) + 1);
  }
  console.log("\nBy seller:");
  for (const [k, n] of [...bySeller.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)}  ${k}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
