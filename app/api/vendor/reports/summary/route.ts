import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorReportsSummary } from "@/lib/data/vendor-reports";

/**
 * GET /api/vendor/reports/summary — summary stats for reports page (orders this month, products listed, total earnings).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);

  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }

  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiSuccess({
      ordersThisMonth: 0,
      productsListed: 0,
      totalEarnings: 0,
    });
  }

  const summary = await getVendorReportsSummary(sellerId);
  return apiSuccess(summary);
});
