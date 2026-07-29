/**
 * Remove default demo admin accounts from the database.
 *
 * Usage (production — load DATABASE_URL first):
 *   source properties.env   # or export DATABASE_URL=...
 *   npx tsx scripts/remove-demo-admins.ts
 */
import { PrismaClient } from "@prisma/client";

/** Seeded demo credentials — must not remain in production. */
const DEMO_ADMIN_EMAILS = ["admin@example.com", "superadmin@example.com"] as const;

async function main() {
  const prisma = new PrismaClient();

  const admins = await prisma.admin.findMany({
    where: { email: { in: [...DEMO_ADMIN_EMAILS] } },
    select: { id: true, email: true, isSuperAdmin: true },
  });

  if (admins.length === 0) {
    console.log("No demo admin accounts found — nothing to remove.");
    return;
  }

  console.log("Removing demo admin accounts:");
  for (const a of admins) {
    console.log(`  - ${a.email}${a.isSuperAdmin ? " (super admin)" : ""}`);
  }

  await prisma.admin.deleteMany({
    where: { email: { in: [...DEMO_ADMIN_EMAILS] } },
  });

  console.log(`Done. Removed ${admins.length} account(s).`);
  console.log(
    "Create real admins via super admin panel, or run: SUPERADMIN_EMAIL=... SUPERADMIN_PASSWORD=... npx tsx scripts/ensure-superadmin.ts",
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
