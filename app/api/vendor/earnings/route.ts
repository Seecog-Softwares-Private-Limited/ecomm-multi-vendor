import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorEarnings } from "@/lib/data/vendor-earnings";

/**
 * GET /api/vendor/earnings — earnings for the logged-in vendor.
 * Query params: dateFrom (YYYY-MM-DD), dateTo (YYYY-MM-DD), orderId (search), payoutStatus (all|paid|unpaid).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);

  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }

  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiSuccess({ summary: { gross: 0, commission: 0, net: 0 }, rows: [] });
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const orderIdSearch = searchParams.get("orderId")?.trim() ?? undefined;
  const payoutStatus = searchParams.get("payoutStatus") as "all" | "paid" | "unpaid" | null;
  const payoutStatusParam =
    payoutStatus && ["all", "paid", "unpaid"].includes(payoutStatus)
      ? payoutStatus
      : undefined;

  const result = await getVendorEarnings({
    sellerId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    orderIdSearch,
    payoutStatus: payoutStatusParam,
  });

  return apiSuccess(result);
});
