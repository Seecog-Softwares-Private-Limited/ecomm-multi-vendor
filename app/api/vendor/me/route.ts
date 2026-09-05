import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiBadRequest, apiNotFound } from "@/lib/api";
import { requireSession, getVendorStatus, verifyPassword, clearAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteVendorAccount } from "@/lib/auth/delete-vendor-account";

/**
 * GET /api/vendor/me — return current vendor session and status (for auth + approval UI).
 * Returns 401 if not authenticated, 403 if not a vendor.
 * Includes status and statusReason so frontend can show status screen when not approved.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  const statusInfo = await getVendorStatus(sellerId);

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: {
      oauthProvider: true,
      appleUserId: true,
    },
  });

  return apiSuccess({
    vendorId: sellerId,
    email: session.email,
    role: session.role,
    status: statusInfo?.status ?? "pending_verification",
    rawStatus: statusInfo?.rawStatus ?? null,
    statusReason: statusInfo?.statusReason ?? null,
    businessName: statusInfo?.businessName ?? null,
    emailVerified: statusInfo?.emailVerified ?? false,
    // Social-created vendors should use Forgot password to set an email password
    // (Change Password "current password" will never match the random hash).
    socialSignInOnly: Boolean(seller?.oauthProvider || seller?.appleUserId),
  });
});

const DELETE_CONFIRM_PHRASE = "DELETE";

/**
 * DELETE /api/vendor/me — permanently deletes the authenticated vendor's account and personal data.
 *
 * Authentication: session cookie (SELLER role required).
 * Body: { password?: string, confirm?: string }
 *   - Password-based vendors must supply their current password in `password`.
 *   - OAuth/passwordless vendors must type the literal string "DELETE" in `confirm`.
 *
 * Complies with Apple App Store Review Guideline 5.1.1(v).
 */
export const DELETE = withApiHandler(async (request: NextRequest) => {
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

  const b = body as Record<string, unknown>;
  const password = typeof b.password === "string" ? b.password : "";
  const confirm = typeof b.confirm === "string" ? b.confirm.trim() : "";

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { id: true, passwordHash: true },
  });
  if (!seller) return apiNotFound("Vendor not found");

  const hash = seller.passwordHash?.trim() ?? "";
  const hasUsablePassword = hash.length >= 20;

  if (hasUsablePassword) {
    if (!password) {
      return apiBadRequest("Enter your password to confirm account deletion.");
    }
    let valid = false;
    try {
      valid = await verifyPassword(password, hash);
    } catch {
      valid = false;
    }
    if (!valid) return apiBadRequest("Password is incorrect.");
  } else {
    if (confirm !== DELETE_CONFIRM_PHRASE) {
      return apiBadRequest(`Type ${DELETE_CONFIRM_PHRASE} to confirm account deletion.`);
    }
  }

  const result = await deleteVendorAccount(sellerId);
  if (!result.deleted) {
    return apiBadRequest(result.reason);
  }

  const response = apiSuccess({ message: "Account deleted successfully", mode: result.mode });
  clearAuthCookie(response);
  return response;
});
