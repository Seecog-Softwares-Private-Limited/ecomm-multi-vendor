/**
 * Read-only: inspect Seller.phone uniqueness, formats, and duplicates.
 * Run: npx tsx scripts/inspect-vendor-phone-dupes.ts
 */
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

function national10(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

async function main() {
  const total = await p.seller.count();
  const active = await p.seller.count({ where: { deletedAt: null } });
  const withPhone = await p.seller.count({
    where: { deletedAt: null, NOT: { phone: null } },
  });
  const phoneNull = await p.seller.count({
    where: { deletedAt: null, phone: null },
  });

  console.log({ total, active, withPhone, phoneNull });

  const all = await p.seller.findMany({
    where: { deletedAt: null, NOT: { phone: null } },
    select: {
      id: true,
      email: true,
      phone: true,
      status: true,
      phoneVerified: true,
      authOnboardingComplete: true,
      oauthProvider: true,
      createdAt: true,
      _count: { select: { products: true, kycDocuments: true } },
    },
  });

  const formatBuckets = new Map<string, number>();
  for (const s of all) {
    const phone = s.phone ?? "";
    const digits = phone.replace(/\D/g, "");
    const hasNonDigit = /\D/.test(phone);
    const key = `len=${phone.length} digits=${digits.length} nonDigit=${hasNonDigit} sample=${JSON.stringify(phone).slice(0, 24)}`;
    // bucket by structural pattern not full sample
    let pattern = "other";
    if (!hasNonDigit && digits.length === 10) pattern = "10-digit";
    else if (!hasNonDigit && digits.length === 12 && digits.startsWith("91")) pattern = "91+10";
    else if (phone.startsWith("+91") && digits.length === 12) pattern = "+91+10";
    else if (hasNonDigit) pattern = `non-digit:${phone.length}`;
    else pattern = `digits=${digits.length}`;
    formatBuckets.set(pattern, (formatBuckets.get(pattern) ?? 0) + 1);
  }
  console.log("\n== Phone format buckets (active, non-null) ==");
  console.log([...formatBuckets.entries()].sort((a, b) => b[1] - a[1]));

  const byNorm = new Map<string, typeof all>();
  for (const s of all) {
    const n = national10(s.phone ?? "");
    if (!n) continue;
    const list = byNorm.get(n) ?? [];
    list.push(s);
    byNorm.set(n, list);
  }

  console.log("\n== Normalized last-10 duplicates (active) ==");
  let dupeGroups = 0;
  for (const [n, list] of byNorm) {
    if (list.length > 1) {
      dupeGroups++;
      console.log(
        n,
        list.map((x) => ({
          id: x.id,
          email: x.email,
          phone: x.phone,
          status: x.status,
          phoneVerified: x.phoneVerified,
          authOnboardingComplete: x.authOnboardingComplete,
          oauth: x.oauthProvider,
          products: x._count.products,
          kyc: x._count.kycDocuments,
          createdAt: x.createdAt,
        }))
      );
    }
  }
  console.log("duplicate groups:", dupeGroups);

  const schema = await p.$queryRawUnsafe<Array<{ COLUMN_NAME: string; COLUMN_KEY: string; COLUMN_TYPE: string }>>(
    `SELECT COLUMN_NAME, COLUMN_KEY, COLUMN_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sellers' AND COLUMN_NAME = 'phone'`
  );
  console.log("\n== sellers.phone column ==");
  console.log(schema);
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
}).finally(async () => {
  await p.$disconnect();
});
