import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { requireSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
 * PATCH /api/vendor/me/password — change authenticated seller password.
 * Body: { currentPassword: string, newPassword: string }
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") {
    return apiForbidden("Vendor access required");
  }

  const sellerId = session.sub?.trim() ?? "";
  if (!sellerId) return apiNotFound("Vendor not found");

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

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { id: true, passwordHash: true, oauthProvider: true, appleUserId: true },
  });

  if (!seller) {
    return apiNotFound("Vendor not found");
  }

  const hash = seller.passwordHash?.trim() ?? "";
  const isSocial = Boolean(seller.oauthProvider || seller.appleUserId);
  if (hash.length < 20) {
    return apiBadRequest(
      "This account uses Google or Apple sign-in and has no password. Use Forgot password to set one, or continue with social login."
    );
  }

  const valid = await verifyPassword(currentPassword, hash);
  if (!valid) {
    return apiBadRequest(
      isSocial
        ? "Current password is incorrect. If you signed in with Google or Apple, use Forgot password first to set an email password."
        : "Current password is incorrect"
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.seller.update({
    where: { id: seller.id },
    data: { passwordHash, updatedAt: new Date() },
  });

  return apiSuccess({ message: "Password updated successfully" });
});
