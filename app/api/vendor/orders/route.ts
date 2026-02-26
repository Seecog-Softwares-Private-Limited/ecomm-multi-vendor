import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorOrdersBySellerId } from "@/lib/data/vendor-orders";

/**
 * GET /api/vendor/orders — list orders for the logged-in vendor (seller).
 * Returns orders that contain at least one item from this seller.
 * Query params: dateFrom, dateTo (YYYY-MM-DD) to filter by order date.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);

  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }

  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiSuccess([]);
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const orders = await getVendorOrdersBySellerId(sellerId, dateFrom, dateTo);
  return apiSuccess(orders);
});
