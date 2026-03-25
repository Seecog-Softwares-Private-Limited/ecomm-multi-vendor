import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { setVendorSupportTicketReply } from "@/lib/data/vendor-support";
import { setCustomerSupportTicketReply } from "@/lib/data/customer-support";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * PATCH /api/admin/support-tickets/[ticketId]/reply — add admin reply/solution (admin only).
 * Body: { reply: string, status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED", ticketType?: "vendor" | "customer" }
 * Defaults to ticketType "vendor" for backward compatibility.
 */
export const PATCH = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "support_tickets");
    if (ctx instanceof Response) return ctx;

    const params = context ? await context.params : {};
    const ticketId = typeof params.ticketId === "string" ? params.ticketId : "";
    if (!ticketId) {
      return apiNotFound("Ticket not found");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiBadRequest("Invalid JSON body");
    }

    const { reply, status, ticketType } = body as {
      reply?: unknown;
      status?: string;
      ticketType?: unknown;
    };
    if (typeof reply !== "string" || !reply.trim()) {
      return apiBadRequest("Reply is required");
    }

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const newStatus =
      typeof status === "string" && validStatuses.includes(status.toUpperCase())
        ? (status.toUpperCase() as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED")
        : undefined;

    const type =
      typeof ticketType === "string" && ticketType.toLowerCase() === "customer"
        ? "customer"
        : "vendor";

    if (type === "customer") {
      const updated = await setCustomerSupportTicketReply(ticketId, {
        reply: reply.trim(),
        status: newStatus,
      });
      if (!updated) return apiNotFound("Ticket not found");
      return apiSuccess(updated);
    }

    const updated = await setVendorSupportTicketReply(ticketId, {
      reply: reply.trim(),
      status: newStatus,
    });

    if (!updated) {
      return apiNotFound("Ticket not found");
    }

    return apiSuccess(updated);
  }
);
