import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { setVendorSupportTicketReply } from "@/lib/data/vendor-support";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * PATCH /api/admin/support-tickets/[ticketId]/reply — add admin reply/solution (admin only).
 * Body: { reply: string, status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
 */
export const PATCH = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "support");
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

    const { reply, status } = body as { reply?: unknown; status?: string };
    if (typeof reply !== "string" || !reply.trim()) {
      return apiBadRequest("Reply is required");
    }

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const newStatus =
      typeof status === "string" && validStatuses.includes(status.toUpperCase())
        ? (status.toUpperCase() as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED")
        : undefined;

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
