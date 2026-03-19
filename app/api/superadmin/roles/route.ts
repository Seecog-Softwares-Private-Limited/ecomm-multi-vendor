import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog, getPermissionsList } from "@/lib/superadmin-auth";

const ALL_PERMISSIONS = getPermissionsList();

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;
  const roles = await prisma.adminRole.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
  return Response.json({
    success: true,
    data: {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: Array.isArray(r.permissions) ? r.permissions : (r.permissions as unknown as string[]),
        description: r.description,
      })),
      permissions: ALL_PERMISSIONS,
    },
  });
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!name) {
    return Response.json({ success: false, message: "name and permissions (array) are required." }, { status: 400 });
  }

  const validPerms = permissions.filter((p: string) => ALL_PERMISSIONS.includes(p));
  const existing = await prisma.adminRole.findFirst({ where: { name, deletedAt: null } });
  if (existing) {
    return Response.json({ success: false, message: "Role name already exists." }, { status: 400 });
  }

  const role = await prisma.adminRole.create({
    data: { name, permissions: validPerms as unknown as object, description: description || null },
  });

  await createAuditLog(session.id, session.email, "create_role", "roles", { roleId: role.id, name: role.name }, request);

  return Response.json({
    success: true,
    data: {
      role: {
        id: role.id,
        name: role.name,
        permissions: Array.isArray(role.permissions) ? role.permissions : (role.permissions as unknown as string[]),
        description: role.description,
      },
    },
  }, { status: 201 });
}
