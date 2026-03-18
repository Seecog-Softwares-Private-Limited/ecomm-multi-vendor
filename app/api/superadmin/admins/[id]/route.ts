import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";

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
  if (typeof body.roleId === "string") {
    const role = await prisma.adminRole.findFirst({ where: { id: body.roleId, deletedAt: null } });
    if (!role) return Response.json({ success: false, message: "Invalid role." }, { status: 400 });
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
