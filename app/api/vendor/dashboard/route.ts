import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorDashboardSummary } from "@/lib/data/vendor-dashboard";

/**
 * GET /api/vendor/dashboard — dashboard summary for the logged-in vendor.
 * Returns KPIs (today's orders, pending orders, revenue 30d, commission, net payable),
 * recent orders, and low stock products.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  const summary = await getVendorDashboardSummary(sellerId);
  return apiSuccess(summary);
});
