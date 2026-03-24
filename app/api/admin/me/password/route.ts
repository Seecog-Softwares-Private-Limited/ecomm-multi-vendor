import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiForbidden,
} from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/admin-rbac";

const NEW_PASSWORD_MIN = 8;
const NEW_PASSWORD_MAX = 128;
const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_NUMBER = /\d/;

function validateNewPassword(p: string): string | null {
  if (p.length < NEW_PASSWORD_MIN) return "Password must be at least 8 characters";
  if (p.length > NEW_PASSWORD_MAX) return "Password too long";
  if (!HAS_UPPER.test(p)) return "Password must contain at least one uppercase letter";
  if (!HAS_LOWER.test(p)) return "Password must contain at least one lowercase letter";
  if (!HAS_NUMBER.test(p)) return "Password must contain at least one number";
  return null;
}

/**
 * PATCH /api/admin/me/password — change admin password (admin only).
 * Body: { currentPassword: string, newPassword: string }
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminContext(request);
  if (ctx instanceof Response) return ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object");
  }

  const o = body as Record<string, unknown>;
  const currentPassword = typeof o.currentPassword === "string" ? o.currentPassword : "";
  const newPassword = typeof o.newPassword === "string" ? o.newPassword : "";

  if (!currentPassword.trim()) {
    return apiBadRequest("Current password is required");
  }

  const newError = validateNewPassword(newPassword);
  if (newError) {
    return apiBadRequest(newError);
  }

  const admin = await prisma.admin.findFirst({
    where: { id: ctx.admin.id, deletedAt: null },
    select: { id: true, passwordHash: true },
  });

  if (!admin) {
    return apiForbidden("Admin not found");
  }

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) {
    return apiBadRequest("Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash, updatedAt: new Date() },
  });

  return apiSuccess({ message: "Password updated successfully" });
});
