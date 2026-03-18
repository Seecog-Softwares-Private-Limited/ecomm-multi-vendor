import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export type SuperAdminSession = {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  role: { id: string; name: string; permissions: unknown } | null;
};

export async function getSuperAdminSession(request: NextRequest): Promise<SuperAdminSession | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "SUPER_ADMIN") return null;
  const admin = await prisma.admin.findFirst({
    where: { id: payload.sub, deletedAt: null },
    include: { role: true },
  });
  if (!admin || !admin.isSuperAdmin) return null;
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    isSuperAdmin: admin.isSuperAdmin,
    role: admin.role
      ? {
          id: admin.role.id,
          name: admin.role.name,
          permissions: admin.role.permissions as unknown,
        }
      : null,
  };
}

export async function requireSuperAdmin(
  request: NextRequest
): Promise<{ session: SuperAdminSession; errorResponse: Response } | { session: SuperAdminSession; errorResponse: null }> {
  const session = await getSuperAdminSession(request);
  if (!session) {
    return {
      session: null!,
      errorResponse: new Response(
        JSON.stringify({ success: false, message: "Unauthorized. Super Admin access required." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
  return { session, errorResponse: null };
}

const PERMISSIONS_LIST = [
  "seller_management",
  "catalog",
  "orders",
  "finance",
  "marketing",
  "support",
  "settings",
];

export function getPermissionsList(): string[] {
  return PERMISSIONS_LIST;
}

export async function createAuditLog(
  adminId: string,
  adminEmail: string,
  action: string,
  module: string,
  metadata: Record<string, unknown> = {},
  request?: NextRequest
): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      module,
      metadata: metadata as object,
      ip: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request?.headers.get("x-real-ip") ?? null,
      userAgent: request?.headers.get("user-agent") ?? null,
    },
  });
}
