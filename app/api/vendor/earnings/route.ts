import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorEarnings } from "@/lib/data/vendor-earnings";

/**
 * GET /api/vendor/earnings — earnings for the logged-in vendor. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

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
