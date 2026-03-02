import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorDashboardSummary } from "@/lib/data/vendor-dashboard";

/**
 * GET /api/vendor/dashboard — dashboard summary for the logged-in vendor.
 * Requires approved status. Returns 403 "Account not approved" otherwise.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);
  const summary = await getVendorDashboardSummary(sellerId);
  return apiSuccess(summary);
});
