import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as string;
  if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
    return Response.json({ success: false, message: "Invalid status." }, { status: 400 });
  }

  const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } });
  if (!admin) {
    return Response.json({ success: false, message: "Admin not found." }, { status: 404 });
  }
  if (admin.isSuperAdmin) {
    return Response.json({ success: false, message: "Cannot change Super Admin status." }, { status: 403 });
  }

  await prisma.admin.update({ where: { id }, data: { status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED" } });
  await createAuditLog(session.id, session.email, "update_admin_status", "admins", { adminId: id, status }, request);

  return Response.json({
    success: true,
    data: { admin: { id, status } },
  });
}
