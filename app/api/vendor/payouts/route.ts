import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorPayouts } from "@/lib/data/vendor-payouts";

/**
 * GET /api/vendor/payouts — payouts and bank account for the logged-in vendor.
 * Query params: dateFrom (YYYY-MM-DD), dateTo (YYYY-MM-DD) — filter by period end date.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);

  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }

  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiSuccess({
      summary: {
        totalPayouts: 0,
        transactionCount: 0,
        lastPayoutAmount: null,
        lastPayoutDate: null,
        ordersPaid: 0,
      },
      payouts: [],
      bankAccount: null,
    });
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const result = await getVendorPayouts(sellerId, dateFrom, dateTo);
  return apiSuccess(result);
});
