import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchAdminColumnsForTicketIds } from "@/lib/data/support-ticket-customer-read";

export interface AdminCustomerTicketItem {
  id: string;
  subject: string;
  status: string;
  orderId: string | null;
  userName: string;
  userEmail: string;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  createdAt: string;
  lastUpdateAt: string | null;
}

function displayUserName(first: string | null, last: string | null): string {
  const parts = [first, last].filter((p): p is string => Boolean(p?.trim()));
  return parts.length > 0 ? parts.join(" ") : "—";
}

/** All customer (user) support tickets for admin dashboard. */
export async function getAdminCustomerSupportTickets(): Promise<AdminCustomerTicketItem[]> {
  const where: Prisma.SupportTicketWhereInput = {
    deletedAt: null,
    user: { deletedAt: null },
  };
  const orderBy = { createdAt: "desc" as const };
  const userSelect = { select: { email: true, firstName: true, lastName: true } } as const;

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy,
    select: {
      id: true,
      subject: true,
      status: true,
      orderId: true,
      createdAt: true,
      lastUpdateAt: true,
      user: userSelect,
    },
  });

  const meta = await fetchAdminColumnsForTicketIds(tickets.map((t) => t.id));

  return tickets.map((t) => {
    const u = t.user;
    const m = meta.get(t.id) ?? { adminReply: null, adminRepliedAt: null };
    return {
      id: t.id,
      subject: t.subject,
      status: t.status,
      orderId: t.orderId,
      userName: displayUserName(u.firstName, u.lastName),
      userEmail: u.email,
      adminReply: m.adminReply,
      adminRepliedAt: m.adminRepliedAt,
      createdAt: t.createdAt.toISOString(),
      lastUpdateAt: t.lastUpdateAt?.toISOString() ?? null,
    };
  });
}

/** Admin reply to a customer support ticket; optionally set status. */
export async function setCustomerSupportTicketReply(
  ticketId: string,
  data: { reply: string; status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
): Promise<AdminCustomerTicketItem | null> {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, deletedAt: null, user: { deletedAt: null } },
    select: {
      id: true,
      subject: true,
      status: true,
      orderId: true,
      createdAt: true,
      lastUpdateAt: true,
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });
  if (!ticket?.user) return null;

  const now = new Date();
  const reply = data.reply.trim();
  const status = data.status;

  try {
    if (status) {
      await prisma.$executeRawUnsafe(
        `UPDATE support_tickets SET admin_reply = ?, admin_replied_at = ?, last_update_at = ?, status = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
        reply,
        now,
        now,
        status,
        now,
        ticketId
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE support_tickets SET admin_reply = ?, admin_replied_at = ?, last_update_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
        reply,
        now,
        now,
        now,
        ticketId
      );
    }
  } catch {
    return null;
  }

  const refreshed = await prisma.supportTicket.findFirst({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      status: true,
      orderId: true,
      createdAt: true,
      lastUpdateAt: true,
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });
  if (!refreshed?.user) return null;

  const meta = await fetchAdminColumnsForTicketIds([ticketId]);
  const m = meta.get(ticketId) ?? { adminReply: null, adminRepliedAt: null };
  const u = refreshed.user;

  return {
    id: refreshed.id,
    subject: refreshed.subject,
    status: refreshed.status,
    orderId: refreshed.orderId,
    userName: displayUserName(u.firstName, u.lastName),
    userEmail: u.email,
    adminReply: m.adminReply,
    adminRepliedAt: m.adminRepliedAt,
    createdAt: refreshed.createdAt.toISOString(),
    lastUpdateAt: refreshed.lastUpdateAt?.toISOString() ?? null,
  };
}
