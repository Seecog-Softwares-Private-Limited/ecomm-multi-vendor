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
import { addCustomerSupportTicketReply } from "@/lib/data/support-ticket-messages";
import { sanitizePlainText } from "@/lib/text-sanitize";
import { uuid, parseWithDetails } from "@/lib/validation";

/**
 * POST /api/support-tickets/:id/reply — customer reply on a ticket.
 * Body: { message: string }
 */
export const POST = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to reply.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can reply to tickets.");

  const params = context?.params ? await context.params : {};
  const rawId = typeof params.id === "string" ? params.id : params.id?.[0];
  const idParsed = parseWithDetails(uuid, rawId);
  if (!idParsed.success) return apiBadRequest("Invalid ticket id");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const rawMessage =
    typeof b.message === "string"
      ? b.message
      : typeof b.body === "string"
        ? b.body
        : "";
  const message = sanitizePlainText(rawMessage, 5000);
  if (!message) return apiBadRequest("message is required.");

  const messages = await addCustomerSupportTicketReply(session.sub, idParsed.data, message);
  if (!messages) return apiNotFound("Ticket not found or closed.");

  return apiSuccess({ messages });
});
