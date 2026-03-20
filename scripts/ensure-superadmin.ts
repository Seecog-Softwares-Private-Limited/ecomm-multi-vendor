/**
 * Create or reset the Super Admin account on the database pointed to by DATABASE_URL.
 * Use this on production when seed was never run or credentials don't work.
 *
 * Usage (from project root, with .env loaded):
 *   npx tsx scripts/ensure-superadmin.ts
 *
 * Optional env (defaults match prisma/seed.ts):
 *   SUPERADMIN_EMAIL    default: superadmin@example.com
 *   SUPERADMIN_PASSWORD default: SuperAdmin@123
 *
 * Production: set SUPERADMIN_PASSWORD to a strong secret before running once.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

/** Legacy broad keys; app maps these to granular permissions. */
const SUPER_ADMIN_PERMISSIONS = [
  "seller_management",
  "catalog",
  "orders",
  "finance",
  "marketing",
  "support",
  "settings",
];

async function main() {
  const email = (process.env.SUPERADMIN_EMAIL || "superadmin@example.com").trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || "SuperAdmin@123";

  if (!email || !password) {
    console.error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD (or defaults) must be non-empty.");
    process.exit(1);
  }

  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: "Super Admin" },
    update: { permissions: SUPER_ADMIN_PERMISSIONS as unknown as object },
    create: {
      name: "Super Admin",
      permissions: SUPER_ADMIN_PERMISSIONS as unknown as object,
      description: "Full access",
    },
  });

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      name: "Super Admin",
      roleId: superAdminRole.id,
      status: "ACTIVE",
      approvalStatus: "APPROVED",
      isSuperAdmin: true,
      deletedAt: null,
    },
    create: {
      email,
      passwordHash,
      name: "Super Admin",
      roleId: superAdminRole.id,
      status: "ACTIVE",
      approvalStatus: "APPROVED",
      isSuperAdmin: true,
    },
  });

  console.log("Super Admin ensured.");
  console.log("  Email:", email);
  console.log("  Login: /superadmin/login");
  console.log("  (Password was set from SUPERADMIN_PASSWORD env or default — change it in production.)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
