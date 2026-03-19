import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth";
import { createAuditLog } from "@/lib/superadmin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });

    if (!admin) {
      return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    if (!admin.isSuperAdmin && admin.approvalStatus !== "APPROVED") {
      return Response.json(
        { success: false, message: "Your account is pending approval." },
        { status: 403 }
      );
    }

    if (!admin.isSuperAdmin && admin.status !== "ACTIVE") {
      return Response.json(
        { success: false, message: "Your account is not active." },
        { status: 403 }
      );
    }

    const token = await signToken({
      sub: admin.id,
      email: admin.email,
      role: admin.isSuperAdmin ? "SUPER_ADMIN" : "ADMIN",
    });

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuditLog(admin.id, admin.email, "login", "auth", {}, request);

    return Response.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role ? { id: admin.role.id, name: admin.role.name, permissions: admin.role.permissions } : null,
          isSuperAdmin: admin.isSuperAdmin,
          status: admin.status,
          approvalStatus: admin.approvalStatus,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
