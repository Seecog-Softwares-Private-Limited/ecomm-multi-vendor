import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorPayouts } from "@/lib/data/vendor-payouts";

/**
 * GET /api/vendor/payouts — payouts and bank account for the logged-in vendor. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const result = await getVendorPayouts(sellerId, dateFrom, dateTo);
  return apiSuccess(result);
});
