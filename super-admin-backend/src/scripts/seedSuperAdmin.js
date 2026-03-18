import { Admin } from "../models/Admin.js";
import { Role } from "../models/Role.js";
import { ALL_PERMISSIONS } from "../constants/permissions.js";

const SUPER_ADMIN_EMAIL = "superadmin@example.com";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@123";
const SUPER_ADMIN_NAME = "Super Admin";

export async function seedSuperAdminIfNeeded() {
  const superAdminRole = await Role.findOne({ name: "Super Admin" });
  let roleId = superAdminRole?._id;
  if (!superAdminRole) {
    const r = await Role.create({
      name: "Super Admin",
      permissions: ALL_PERMISSIONS,
      description: "Full access",
    });
    roleId = r._id;
  }

  const existing = await Admin.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) return;
  await Admin.create({
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    role: roleId,
    status: "active",
    approvalStatus: "approved",
    isSuperAdmin: true,
  });
  console.log("Seeded Super Admin:", SUPER_ADMIN_EMAIL, "(password: " + SUPER_ADMIN_PASSWORD + ")");
}
