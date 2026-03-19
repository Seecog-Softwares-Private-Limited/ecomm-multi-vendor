import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const approvalStatus = searchParams.get("approvalStatus") ?? "";
  const roleId = searchParams.get("roleId") ?? "";

  const where: Prisma.AdminWhereInput = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  const statusUpper = status ? status.toUpperCase() : "";
  const approvalUpper = approvalStatus ? approvalStatus.toUpperCase() : "";
  if (statusUpper && ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(statusUpper)) where.status = statusUpper as "ACTIVE" | "INACTIVE" | "SUSPENDED";
  if (approvalUpper && ["PENDING", "APPROVED", "REJECTED"].includes(approvalUpper)) where.approvalStatus = approvalUpper as "PENDING" | "APPROVED" | "REJECTED";
  if (roleId) where.roleId = roleId;

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.admin.count({ where }),
  ]);

  const items = admins.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role ? { id: a.role.id, name: a.role.name, permissions: a.role.permissions } : null,
    status: a.status,
    approvalStatus: a.approvalStatus,
    isSuperAdmin: a.isSuperAdmin,
    createdAt: a.createdAt,
    lastLoginAt: a.lastLoginAt,
  }));

  return Response.json({
    success: true,
    data: {
      admins: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const roleId = typeof body.roleId === "string" ? body.roleId : "";
  const status = (body.status as string) || "INACTIVE";
  const approvalStatus = (body.approvalStatus as string) || "PENDING";

  if (!name || !email || !password || !roleId) {
    return Response.json(
      { success: false, message: "name, email, password and roleId are required." },
      { status: 400 }
    );
  }

  const role = await prisma.adminRole.findFirst({ where: { id: roleId, deletedAt: null } });
  if (!role) {
    return Response.json({ success: false, message: "Invalid role." }, { status: 400 });
  }
  if (role.name.trim().toLowerCase() === "super admin") {
    return Response.json({ success: false, message: "Cannot assign Super Admin role to regular admin." }, { status: 400 });
  }

  const existing = await prisma.admin.findFirst({ where: { email, deletedAt: null } });
  if (existing) {
    return Response.json({ success: false, message: "Email already registered." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: {
      name,
      email,
      passwordHash,
      role: { connect: { id: roleId } },
      status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
      approvalStatus: approvalStatus as "PENDING" | "APPROVED" | "REJECTED",
      isSuperAdmin: false,
    },
    include: { role: true },
  });

  await createAuditLog(session.id, session.email, "create_admin", "admins", { adminId: admin.id, email: admin.email }, request);

  return Response.json({
    success: true,
    data: {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role ? { id: admin.role.id, name: admin.role.name, permissions: admin.role.permissions } : null,
        status: admin.status,
        approvalStatus: admin.approvalStatus,
        createdAt: admin.createdAt,
      },
    },
  }, { status: 201 });
}
