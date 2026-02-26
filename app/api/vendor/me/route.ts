import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiNotFound } from "@/lib/api";
import { requireSession } from "@/lib/auth";

/**
 * GET /api/vendor/me — return current vendor session (for auth check).
 * Returns 401 if not authenticated, 403 if not a vendor.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  return apiSuccess({
    vendorId: sellerId,
    email: session.email,
    role: session.role,
  });
});
