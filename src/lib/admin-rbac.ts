import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { apiForbidden, apiUnauthorized } from "@/lib/api";

export type AdminPermission =
  | "dashboard"
  | "sellers"
  | "categories"
  | "products"
  | "orders"
  | "returns"
  | "settlements"
  | "analytics"
  | "support_tickets"
  | "notifications"
  | "settings";

export type AdminContext = {
  admin: {
    id: string;
    email: string;
    name: string | null;
    isSuperAdmin: boolean;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    role: { id: string; name: string; permissions: string[] } | null;
  };
  permissions: Set<string>;
};

function normalizePermissions(p: unknown): string[] {
  if (Array.isArray(p)) return p.filter((x) => typeof x === "string") as string[];
  return [];
}

const LEGACY_TO_GRANULAR: Record<string, AdminPermission[]> = {
  seller_management: ["sellers"],
  catalog: ["categories", "products"],
  orders: ["orders", "returns", "analytics"],
  finance: ["settlements"],
  support: ["support_tickets"],
  settings: ["notifications", "settings"],
  marketing: [],
};

const SUPER_ADMIN_ALL_PERMISSIONS: AdminPermission[] = [
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
  "settings",
];

export function expandAdminPermissions(raw: string[]): string[] {
  const out = new Set<string>();
  for (const permission of raw) {
    out.add(permission);
    const expanded = LEGACY_TO_GRANULAR[permission];
    if (expanded) expanded.forEach((p) => out.add(p));
  }
  return Array.from(out);
}

export async function requireAdminContext(request: NextRequest): Promise<AdminContext | NextResponse> {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") return apiForbidden("Admin access required");

  const admin = await prisma.admin.findFirst({
    where: { id: session.sub, deletedAt: null },
    include: { role: true },
  });
  if (!admin) return apiUnauthorized("Admin not found");

  // Non-super-admin admins must be approved & active
  if (!admin.isSuperAdmin) {
    if (admin.approvalStatus !== "APPROVED") return apiForbidden("Admin account is not approved");
    if (admin.status !== "ACTIVE") return apiForbidden("Admin account is not active");
  }

  const permissions = admin.isSuperAdmin
    ? new Set<string>(SUPER_ADMIN_ALL_PERMISSIONS)
    : new Set<string>(expandAdminPermissions(normalizePermissions(admin.role?.permissions)));

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isSuperAdmin: admin.isSuperAdmin,
      status: admin.status,
      approvalStatus: admin.approvalStatus,
      role: admin.role
        ? {
            id: admin.role.id,
            name: admin.role.name,
            permissions: normalizePermissions(admin.role.permissions),
          }
        : null,
    },
    permissions,
  };
}

export async function requireAdminPermission(
  request: NextRequest,
  permission: AdminPermission
): Promise<AdminContext | NextResponse> {
  const ctx = await requireAdminContext(request);
  if (ctx instanceof Response) return ctx;
  if (ctx.admin.isSuperAdmin) return ctx;
  if (!ctx.permissions.has(permission)) return apiForbidden("Permission denied");
  return ctx;
}

