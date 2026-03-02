import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorReportsSummary } from "@/lib/data/vendor-reports";

/**
 * GET /api/vendor/reports/summary — summary stats for reports page. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  const summary = await getVendorReportsSummary(sellerId);
  return apiSuccess(summary);
});
