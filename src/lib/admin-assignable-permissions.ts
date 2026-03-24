/**
 * Permission keys Super Admin can assign to roles (Settings is Super Admin only).
 * Keep this file free of Prisma, bcrypt, or other Node-only imports — client components may import it.
 */
export const ADMIN_ASSIGNABLE_PERMISSION_KEYS = [
  "dashboard",
  "sellers",
  "categories",
  "products",
  "orders",
  "returns",
  "settlements",
  "analytics",
  "support_tickets",
  "notifications",
  "cms",
] as const;

export type AdminAssignablePermissionKey = (typeof ADMIN_ASSIGNABLE_PERMISSION_KEYS)[number];
