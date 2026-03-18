import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string;
  if (!["approve", "reject"].includes(action)) {
    return Response.json({ success: false, message: "action must be 'approve' or 'reject'." }, { status: 400 });
  }

  const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } });
  if (!admin) {
    return Response.json({ success: false, message: "Admin not found." }, { status: 404 });
  }
  if (admin.isSuperAdmin) {
    return Response.json({ success: false, message: "Cannot change Super Admin approval." }, { status: 403 });
  }

  const approvalStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const status = action === "approve" ? "ACTIVE" : admin.status;

  await prisma.admin.update({
    where: { id },
    data: { approvalStatus: approvalStatus as "APPROVED" | "REJECTED", status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED" },
  });
  await createAuditLog(session.id, session.email, `admin_${action}`, "admins", { adminId: id }, request);

  return Response.json({
    success: true,
    data: { admin: { id, approvalStatus, status } },
  });
}
