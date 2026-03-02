import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorOrdersBySellerId } from "@/lib/data/vendor-orders";

/**
 * GET /api/vendor/orders — list orders for the logged-in vendor. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const orders = await getVendorOrdersBySellerId(sellerId, dateFrom, dateTo);
  return apiSuccess(orders);
});
