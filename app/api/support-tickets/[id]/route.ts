import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiNotFound, apiUnauthorized, apiForbidden } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getOneCustomerSupportTicketForUser } from "@/lib/data/support-ticket-customer-read";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * GET /api/support-tickets/[id] — get one support ticket (customer's own).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view support tickets.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their support tickets.");

  const params = context?.params ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  if (!id?.trim()) return apiNotFound("Ticket not found.");

  const ticket = await getOneCustomerSupportTicketForUser(session.sub, id.trim());

  if (!ticket) return apiNotFound("Ticket not found.");

  return apiSuccess({
    ticket: {
      id: ticket.id,
      shortId: ticket.shortId,
      subject: ticket.subject,
      status: ticket.status,
      orderId: ticket.orderId,
      createdAt: ticket.createdAt,
      lastUpdateAt: ticket.lastUpdateAt,
      updatedAt: ticket.updatedAt,
      adminReply: ticket.adminReply,
      adminRepliedAt: ticket.adminRepliedAt,
    },
  });
});
