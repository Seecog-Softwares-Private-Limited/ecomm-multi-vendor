import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SupportTicketStatus } from "@prisma/client";

const VALID_STATUSES: SupportTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

/**
 * GET /api/support-tickets — list current user's support tickets.
 * Query: ?status=OPEN|IN_PROGRESS|RESOLVED|CLOSED (optional)
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view support tickets.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their support tickets.");

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.trim().toUpperCase();

  const where: { userId: string; deletedAt: null; status?: SupportTicketStatus } = {
    userId: session.sub,
    deletedAt: null,
  };
  if (statusParam && VALID_STATUSES.includes(statusParam as SupportTicketStatus)) {
    where.status = statusParam as SupportTicketStatus;
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subject: true,
      status: true,
      orderId: true,
      createdAt: true,
      lastUpdateAt: true,
    },
  });

  const list = tickets.map((t) => ({
    id: t.id,
    shortId: `#TKT-${t.id.slice(0, 8).toUpperCase()}`,
    subject: t.subject,
    status: t.status,
    orderId: t.orderId,
    createdAt: t.createdAt.toISOString(),
    lastUpdateAt: t.lastUpdateAt?.toISOString() ?? null,
  }));

  return apiSuccess({ tickets: list });
});

/**
 * POST /api/support-tickets — create a new support ticket.
 * Body: { subject: string, orderId?: string }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to create a support ticket.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can create support tickets.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const orderId = typeof b.orderId === "string" ? b.orderId.trim() || null : null;

  if (!subject) return apiBadRequest("subject is required.");

  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.sub },
      select: { id: true },
    });
    if (!order) return apiBadRequest("Order not found or not yours.");
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.sub,
      subject,
      orderId,
    },
    select: {
      id: true,
      subject: true,
      status: true,
      orderId: true,
      createdAt: true,
    },
  });

  return apiSuccess({
    ticket: {
      id: ticket.id,
      shortId: `#TKT-${ticket.id.slice(0, 8).toUpperCase()}`,
      subject: ticket.subject,
      status: ticket.status,
      orderId: ticket.orderId,
      createdAt: ticket.createdAt.toISOString(),
    },
  });
});
