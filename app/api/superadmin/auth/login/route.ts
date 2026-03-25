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

    let token: string;
    try {
      token = await signToken({
        sub: admin.id,
        email: admin.email,
        role: admin.isSuperAdmin ? "SUPER_ADMIN" : "ADMIN",
      });
    } catch (signErr) {
      const m = signErr instanceof Error ? signErr.message : String(signErr);
      const isJwt = /JWT_SECRET|jwt/i.test(m);
      console.error("[superadmin/login] signToken failed:", signErr);
      return Response.json(
        {
          success: false,
          message: isJwt
            ? "Server is missing JWT_SECRET. Add JWT_SECRET to .env (e.g. openssl rand -base64 32), restart the app, then try again."
            : "Could not create session. Check server logs.",
        },
        { status: 503 }
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    try {
      await createAuditLog(admin.id, admin.email, "login", "auth", {}, request);
    } catch (auditErr) {
      /* Login must succeed even if audit table is missing or DB write fails */
      console.error("[superadmin/login] audit log failed (non-fatal):", auditErr);
    }

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
