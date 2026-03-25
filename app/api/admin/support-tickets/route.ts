import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { getAdminVendorSupportTickets } from "@/lib/data/vendor-support";
import { getAdminCustomerSupportTickets } from "@/lib/data/customer-support";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * GET /api/admin/support-tickets — vendor + customer support tickets (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "support_tickets");
  if (ctx instanceof Response) return ctx;
  const [vendorTickets, customerTickets] = await Promise.all([
    getAdminVendorSupportTickets(),
    getAdminCustomerSupportTickets(),
  ]);
  return apiSuccess({ vendorTickets, customerTickets });
});
