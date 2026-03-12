import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getAdminVendorSupportTickets } from "@/lib/data/vendor-support";

/**
 * GET /api/admin/support-tickets — list all vendor support tickets (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }
  const tickets = await getAdminVendorSupportTickets();
  return apiSuccess(tickets);
});
