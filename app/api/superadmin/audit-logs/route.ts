import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin-auth";

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const adminId = searchParams.get("adminId") ?? "";
  const module = searchParams.get("module") ?? "";
  const action = searchParams.get("action") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const where: { adminId?: string; module?: string; action?: string; createdAt?: { gte?: Date; lte?: Date } } = {};
  if (adminId) where.adminId = adminId;
  if (module) where.module = module;
  if (action) where.action = action;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  const items = logs.map((l) => ({
    id: l.id,
    adminId: l.adminId,
    adminName: l.admin.name,
    adminEmail: l.admin.email,
    action: l.action,
    module: l.module,
    metadata: l.metadata,
    createdAt: l.createdAt,
    ip: l.ip,
  }));

  return Response.json({
    success: true,
    data: {
      logs: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
}
