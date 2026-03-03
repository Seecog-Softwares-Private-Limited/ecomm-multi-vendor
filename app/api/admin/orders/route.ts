import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getAdminOrders, type AdminOrderStatusFilter } from "@/lib/data/admin-orders";

/**
 * GET /api/admin/orders — list orders for admin with optional filters and stats.
 * Query: status, dateFrom, dateTo, page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status")?.trim() || "") as AdminOrderStatusFilter | "";
  const dateFrom = searchParams.get("dateFrom")?.trim() || undefined;
  const dateTo = searchParams.get("dateTo")?.trim() || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10) || 10));

  const result = await getAdminOrders({
    status: status || undefined,
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  return apiSuccess(result);
});
