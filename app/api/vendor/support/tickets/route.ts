import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import {
  createVendorSupportTicket,
  getVendorSupportTickets,
} from "@/lib/data/vendor-support";

/**
 * GET /api/vendor/support/tickets — list support tickets. Allowed for all vendors (including not approved) so they can contact support.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") return apiForbidden("Vendor access required");
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  const tickets = await getVendorSupportTickets(sellerId);
  return apiSuccess(tickets);
});

/**
 * POST /api/vendor/support/tickets — create a support ticket. Allowed for all vendors so rejected/blocked can contact support.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") return apiForbidden("Vendor access required");
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const { subject, category, message } = body as Record<string, unknown>;
  if (typeof subject !== "string" || !subject.trim()) {
    return apiBadRequest("Subject is required");
  }
  if (typeof category !== "string" || !category.trim()) {
    return apiBadRequest("Category is required");
  }
  if (typeof message !== "string" || !message.trim()) {
    return apiBadRequest("Message is required");
  }

  const ticket = await createVendorSupportTicket(sellerId, {
    subject: subject.trim(),
    category: category.trim(),
    message: message.trim(),
  });
  return apiSuccess(ticket);
});
