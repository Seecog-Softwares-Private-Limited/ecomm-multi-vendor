import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiNotFound } from "@/lib/api";
import { requireSession, getVendorStatus } from "@/lib/auth";

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

  return apiSuccess({
    vendorId: sellerId,
    email: session.email,
    role: session.role,
    status: statusInfo?.status ?? "pending_verification",
    rawStatus: statusInfo?.rawStatus ?? null,
    statusReason: statusInfo?.statusReason ?? null,
    businessName: statusInfo?.businessName ?? null,
    emailVerified: statusInfo?.emailVerified ?? false,
  });
});
