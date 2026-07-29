import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getSupportTicketMessagesForCustomer } from "@/lib/data/support-ticket-messages";
import { uuid, parseWithDetails } from "@/lib/validation";

/**
 * GET /api/support-tickets/:id/messages — full conversation thread.
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view support tickets.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their tickets.");

  const params = context?.params ? await context.params : {};
  const rawId = typeof params.id === "string" ? params.id : params.id?.[0];
  const idParsed = parseWithDetails(uuid, rawId);
  if (!idParsed.success) return apiBadRequest("Invalid ticket id");

  const messages = await getSupportTicketMessagesForCustomer(session.sub, idParsed.data);
  if (!messages) return apiNotFound("Ticket not found.");

  return apiSuccess({ messages });
});
