import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { getAdminVendorSupportTickets } from "@/lib/data/vendor-support";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * GET /api/admin/support-tickets — list all vendor support tickets (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "support");
  if (ctx instanceof Response) return ctx;
  const tickets = await getAdminVendorSupportTickets();
  return apiSuccess(tickets);
});
