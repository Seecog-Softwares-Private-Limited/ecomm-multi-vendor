import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";
import { ADMIN_ASSIGNABLE_PERMISSION_KEYS } from "@/lib/admin-assignable-permissions";

const ASSIGNABLE_PERM_SET = new Set<string>(ADMIN_ASSIGNABLE_PERMISSION_KEYS);

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null }, include: { role: true } });
  if (!admin) {
    return Response.json({ success: false, message: "Admin not found." }, { status: 404 });
  }
  if (admin.isSuperAdmin) {
    return Response.json({ success: false, message: "Cannot modify Super Admin." }, { status: 403 });
  }

  const updates: Parameters<typeof prisma.admin.update>[0]["data"] = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.email === "string") updates.email = body.email.trim().toLowerCase();

  /** Direct module assignment: one hidden role per admin (`Direct:{adminId}`). Settings is never assignable. */
  if (Array.isArray((body as { permissions?: unknown }).permissions)) {
    const raw = (body as { permissions: unknown }).permissions;
    const list = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
    const valid = list.filter((p) => ASSIGNABLE_PERM_SET.has(p));
    const roleName = `Direct:${id}`.slice(0, 100);
    const existing = await prisma.adminRole.findFirst({
      where: { name: roleName, deletedAt: null },
    });
    const permJson = valid as unknown as Prisma.InputJsonValue;
    const directRole = existing
      ? await prisma.adminRole.update({
          where: { id: existing.id },
          data: {
            permissions: permJson,
            description: "Direct permissions (set from Super Admin)",
          },
        })
      : await prisma.adminRole.create({
          data: {
            name: roleName,
            permissions: permJson,
            description: "Direct permissions (set from Super Admin)",
          },
        });
    updates.role = { connect: { id: directRole.id } };
  }

  const roleIdsInput = Array.isArray(body.roleIds)
    ? body.roleIds.filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
    : [];

  if (!updates.role && roleIdsInput.length > 0) {
    const selectedRoles = await prisma.adminRole.findMany({
      where: { id: { in: roleIdsInput }, deletedAt: null },
      select: { id: true, name: true, permissions: true },
    });
    if (selectedRoles.length !== new Set(roleIdsInput).size) {
      return Response.json({ success: false, message: "One or more selected roles are invalid." }, { status: 400 });
    }
    if (selectedRoles.some((r) => r.name.trim().toLowerCase() === "super admin")) {
      return Response.json({ success: false, message: "Cannot assign Super Admin role to regular admin." }, { status: 400 });
    }

    if (selectedRoles.length === 1) {
      updates.role = { connect: { id: selectedRoles[0]!.id } };
    } else {
      const mergedPermissions = Array.from(
        new Set(
          selectedRoles.flatMap((r) =>
            Array.isArray(r.permissions)
              ? r.permissions.filter((p): p is string => typeof p === "string")
              : []
          )
        )
      );
      const mergedName = `Combined: ${selectedRoles.map((r) => r.name).join(" + ")}`.slice(0, 100);
      const existingMerged = await prisma.adminRole.findFirst({
        where: { name: mergedName, deletedAt: null },
      });
      const mergedRole = existingMerged
        ? await prisma.adminRole.update({
            where: { id: existingMerged.id },
            data: {
              permissions: mergedPermissions as unknown as Prisma.InputJsonValue,
              description: `Auto-generated combined role for admin ${admin.email}`,
            },
          })
        : await prisma.adminRole.create({
            data: {
              name: mergedName,
              permissions: mergedPermissions as unknown as Prisma.InputJsonValue,
              description: `Auto-generated combined role for admin ${admin.email}`,
            },
          });
      updates.role = { connect: { id: mergedRole.id } };
    }
  } else if (!updates.role && typeof body.roleId === "string") {
    const role = await prisma.adminRole.findFirst({ where: { id: body.roleId, deletedAt: null } });
    if (!role) return Response.json({ success: false, message: "Invalid role." }, { status: 400 });
    if (role.name.trim().toLowerCase() === "super admin") {
      return Response.json({ success: false, message: "Cannot assign Super Admin role to regular admin." }, { status: 400 });
    }
    updates.role = { connect: { id: body.roleId } };
  }
  if (["ACTIVE", "INACTIVE", "SUSPENDED"].includes(body.status)) updates.status = body.status;
  if (["PENDING", "APPROVED", "REJECTED"].includes(body.approvalStatus)) updates.approvalStatus = body.approvalStatus;

  const updated = await prisma.admin.update({
    where: { id },
    data: updates,
    include: { role: true },
  });

  await createAuditLog(session.id, session.email, "update_admin", "admins", { adminId: id }, request);

  return Response.json({
    success: true,
    data: {
      admin: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role ? { id: updated.role.id, name: updated.role.name, permissions: updated.role.permissions } : null,
        status: updated.status,
        approvalStatus: updated.approvalStatus,
        updatedAt: updated.updatedAt,
      },
    },
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } });
  if (!admin) {
    return Response.json({ success: false, message: "Admin not found." }, { status: 404 });
  }
  if (admin.isSuperAdmin) {
    return Response.json({ success: false, message: "Cannot delete Super Admin." }, { status: 403 });
  }

  await prisma.admin.update({ where: { id }, data: { deletedAt: new Date() } });
  await createAuditLog(session.id, session.email, "delete_admin", "admins", { adminId: id, email: admin.email }, request);

  return Response.json({ success: true, data: { deleted: true } });
}
