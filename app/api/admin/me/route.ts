import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiForbidden,
  apiValidationError,
  apiConflict,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expandAdminPermissions } from "@/lib/admin-rbac";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/admin/me — current admin profile (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const admin = await prisma.admin.findFirst({
    where: { id: session.sub, deletedAt: null },
    include: { role: true },
  });

  if (!admin) {
    return apiForbidden("Admin not found");
  }

  const name = admin.name ?? "";
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ") || "";

  const permissions =
    admin.isSuperAdmin
      ? ["dashboard", "sellers", "categories", "products", "orders", "returns", "settlements", "analytics", "support_tickets", "notifications", "settings"]
      : Array.isArray(admin.role?.permissions)
        ? expandAdminPermissions(admin.role?.permissions as unknown as string[])
        : [];

  return apiSuccess({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    phone: admin.phone ?? "",
    firstName: firstName || "Admin",
    lastName: lastName || "User",
    status: admin.status,
    approvalStatus: admin.approvalStatus,
    isSuperAdmin: admin.isSuperAdmin,
    role: admin.role ? { id: admin.role.id, name: admin.role.name } : null,
    permissions,
  });
});

/**
 * PATCH /api/admin/me — update admin profile (admin only).
 * Body: { firstName?, lastName?, email?, phone? }
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return apiValidationError("Validation failed", { body: "Must be an object" });
  }

  const o = body as Record<string, unknown>;
  const firstName = typeof o.firstName === "string" ? o.firstName.trim() : "";
  const lastName = typeof o.lastName === "string" ? o.lastName.trim() : "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || null;
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : undefined;
  const phone = typeof o.phone === "string" ? o.phone.trim() || null : undefined;

  if (email !== undefined) {
    if (!email) {
      return apiValidationError("Email is required", { email: "Enter an email address" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return apiValidationError("Invalid email format", { email: "Enter a valid email address" });
    }
    const existing = await prisma.admin.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });
    if (existing && existing.id !== session.sub) {
      return apiConflict("An account with this email already exists");
    }
  }

  await prisma.admin.update({
    where: { id: session.sub },
    data: {
      name,
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
    },
  });

  return apiSuccess({ message: "Profile updated" });
});
