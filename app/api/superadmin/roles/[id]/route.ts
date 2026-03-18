import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog, getPermissionsList } from "@/lib/superadmin-auth";

const ALL_PERMISSIONS = getPermissionsList();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const role = await prisma.adminRole.findFirst({ where: { id, deletedAt: null } });
  if (!role) {
    return Response.json({ success: false, message: "Role not found." }, { status: 404 });
  }

  const updates: Parameters<typeof prisma.adminRole.update>[0]["data"] = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (Array.isArray(body.permissions)) {
    const filtered = body.permissions.filter((p: unknown): p is string => typeof p === "string" && ALL_PERMISSIONS.includes(p));
    updates.permissions = filtered as unknown as Prisma.InputJsonValue;
  }
  if (typeof body.description === "string") updates.description = body.description.trim() || null;

  const updated = await prisma.adminRole.update({
    where: { id },
    data: updates,
  });

  await createAuditLog(session.id, session.email, "update_role", "roles", { roleId: id }, request);

  return Response.json({
    success: true,
    data: {
      role: {
        id: updated.id,
        name: updated.name,
        permissions: Array.isArray(updated.permissions) ? updated.permissions : (updated.permissions as unknown as string[]),
        description: updated.description,
      },
    },
  });
}
