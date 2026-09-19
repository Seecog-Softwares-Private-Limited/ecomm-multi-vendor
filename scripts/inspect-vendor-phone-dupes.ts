/**
 * Inspect Seller phone duplicates (read-only).
 * Run: npx tsx scripts/inspect-vendor-phone-dupes.ts
 */
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const phones = ["+917348820668", "7348820668", "1236547895"];
  for (const phone of phones) {
    const rows = await p.seller.findMany({
      where: { deletedAt: null, phone },
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        phoneVerified: true,
        oauthProvider: true,
        appleUserId: true,
        createdAt: true,
        _count: { select: { products: true, orderItems: true, kycDocuments: true } },
      },
    });
    console.log("\nPHONE", phone, "count", rows.length);
    for (const r of rows) {
      console.log(
        JSON.stringify({
          id: r.id,
          email: r.email,
          status: r.status,
          phoneVerified: r.phoneVerified,
          oauth: r.oauthProvider,
          apple: Boolean(r.appleUserId),
          products: r._count.products,
          orders: r._count.orderItems,
          kyc: r._count.kycDocuments,
          createdAt: r.createdAt,
        })
      );
    }
  }

  // Normalized national last-10 grouping
  const all = await p.seller.findMany({
    where: { deletedAt: null, NOT: { phone: null } },
    select: { id: true, email: true, phone: true, status: true },
  });
  const byNorm = new Map<string, typeof all>();
  for (const s of all) {
    const digits = (s.phone ?? "").replace(/\D/g, "");
    const national = digits.length >= 10 ? digits.slice(-10) : digits;
    if (!national) continue;
    const list = byNorm.get(national) ?? [];
    list.push(s);
    byNorm.set(national, list);
  }
  console.log("\n== Normalized last-10 duplicates ==");
  for (const [n, list] of byNorm) {
    if (list.length > 1) {
      console.log(n, list.map((x) => ({ id: x.id, email: x.email, phone: x.phone, status: x.status })));
    }
  }

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
