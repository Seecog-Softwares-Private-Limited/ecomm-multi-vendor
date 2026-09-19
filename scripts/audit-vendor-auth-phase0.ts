/**
 * Read-only Phase 0 Seller data audit. Does not mutate data.
 * Run: npx tsx scripts/audit-vendor-auth-phase0.ts
 */
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const total = await p.seller.count();
  const active = await p.seller.count({ where: { deletedAt: null } });
  const deleted = await p.seller.count({ where: { deletedAt: { not: null } } });
  const withPhone = await p.seller.count({
    where: { deletedAt: null, NOT: { phone: null } },
  });
  const phoneVerified = await p.seller.count({
    where: { deletedAt: null, phoneVerified: true },
  });
  const withOauth = await p.seller.count({
    where: { deletedAt: null, NOT: { oauthProviderId: null } },
  });
  const withApple = await p.seller.count({
    where: { deletedAt: null, NOT: { appleUserId: null } },
  });
  const approved = await p.seller.count({
    where: { deletedAt: null, status: "APPROVED" },
  });
  const statuses = await p.seller.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: true,
  });
  const dupEmails = await p.$queryRawUnsafe<
    Array<{ email: string; c: bigint }>
  >(
    `SELECT email, COUNT(*) as c FROM sellers WHERE deleted_at IS NULL GROUP BY email HAVING c > 1`
  );
  const dupPhones = await p.$queryRawUnsafe<
    Array<{ phone: string; c: bigint }>
  >(
    `SELECT phone, COUNT(*) as c FROM sellers WHERE deleted_at IS NULL AND phone IS NOT NULL AND TRIM(phone) <> '' GROUP BY phone HAVING c > 1`
  );
  const dupOauth = await p.$queryRawUnsafe<
    Array<{ oauth_provider: string; oauth_provider_id: string; c: bigint }>
  >(
    `SELECT oauth_provider, oauth_provider_id, COUNT(*) as c FROM sellers WHERE deleted_at IS NULL AND oauth_provider_id IS NOT NULL GROUP BY oauth_provider, oauth_provider_id HAVING c > 1`
  );
  const dupApple = await p.$queryRawUnsafe<
    Array<{ apple_user_id: string; c: bigint }>
  >(
    `SELECT apple_user_id, COUNT(*) as c FROM sellers WHERE deleted_at IS NULL AND apple_user_id IS NOT NULL GROUP BY apple_user_id HAVING c > 1`
  );
  const withProducts = await p.seller.count({
    where: { deletedAt: null, products: { some: {} } },
  });
  const withKyc = await p.seller.count({
    where: { deletedAt: null, kycDocuments: { some: {} } },
  });
  const withOrders = await p.seller.count({
    where: { deletedAt: null, orderItems: { some: {} } },
  });
  const shortHash = await p.$queryRawUnsafe<Array<{ c: bigint }>>(
    `SELECT COUNT(*) as c FROM sellers WHERE deleted_at IS NULL AND (password_hash IS NULL OR CHAR_LENGTH(TRIM(password_hash)) < 20)`
  );
  const placeholderLike = await p.$queryRawUnsafe<Array<{ c: bigint }>>(
    `SELECT COUNT(*) as c FROM sellers WHERE deleted_at IS NULL AND (
      email LIKE '%@phone-otp.%' OR email LIKE '%@pending.%' OR email LIKE '%privaterelay.appleid.com%'
    )`
  );
  const phoneUnverifiedWithPhone = await p.seller.count({
    where: {
      deletedAt: null,
      phoneVerified: false,
      NOT: { phone: null },
    },
  });
  const approvedNoPhoneVerified = await p.seller.count({
    where: {
      deletedAt: null,
      status: "APPROVED",
      phoneVerified: false,
    },
  });

  const serialize = (rows: Array<Record<string, unknown>>) =>
    rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])
      )
    );

  console.log(
    JSON.stringify(
      {
        total,
        active,
        deleted,
        withPhone,
        phoneVerified,
        phoneUnverifiedWithPhone,
        approvedNoPhoneVerified,
        withOauth,
        withApple,
        approved,
        statuses,
        dupEmails: serialize(dupEmails as unknown as Array<Record<string, unknown>>),
        dupPhones: serialize(dupPhones as unknown as Array<Record<string, unknown>>),
        dupOauth: serialize(dupOauth as unknown as Array<Record<string, unknown>>),
        dupApple: serialize(dupApple as unknown as Array<Record<string, unknown>>),
        withProducts,
        withKyc,
        withOrders,
        shortOrNullPasswordHash: Number(shortHash[0]?.c ?? 0),
        placeholderOrRelayEmails: Number(placeholderLike[0]?.c ?? 0),
      },
      null,
      2
    )
  );
  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
