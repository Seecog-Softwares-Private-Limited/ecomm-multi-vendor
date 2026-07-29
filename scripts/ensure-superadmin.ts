/**
 * Create or reset the Super Admin account on the database pointed to by DATABASE_URL.
 *
 * Usage (from project root, with DATABASE_URL loaded):
 *   SUPERADMIN_EMAIL=you@company.com SUPERADMIN_PASSWORD='your-secure-password' npx tsx scripts/ensure-superadmin.ts
 *
 * Required env:
 *   SUPERADMIN_EMAIL
 *   SUPERADMIN_PASSWORD
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  const email = (process.env.SUPERADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required.");
    console.error("Example:");
    console.error("  SUPERADMIN_EMAIL=admin@yourcompany.com SUPERADMIN_PASSWORD='...' npx tsx scripts/ensure-superadmin.ts");
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

  const passwordHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
