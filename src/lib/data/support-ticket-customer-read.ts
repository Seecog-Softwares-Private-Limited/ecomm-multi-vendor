import type { SupportTicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Load admin_reply / admin_replied_at without using Prisma Client field selection.
 * Works when `npx prisma generate` was not run after adding those columns to the schema,
 * and when DB columns exist (migration / db push).
 */
export async function fetchAdminColumnsForTicketIds(
  ids: string[]
): Promise<Map<string, { adminReply: string | null; adminRepliedAt: string | null }>> {
  const map = new Map<string, { adminReply: string | null; adminRepliedAt: string | null }>();
  if (ids.length === 0) return map;
  try {
    const placeholders = ids.map(() => "?").join(",");
    const rows = await prisma.$queryRawUnsafe<
      { id: string; admin_reply: string | null; admin_replied_at: Date | null }[]
    >(
      `SELECT id, admin_reply, admin_replied_at FROM support_tickets WHERE deleted_at IS NULL AND id IN (${placeholders})`,
      ...ids
    );
    for (const r of rows) {
      map.set(r.id, {
        adminReply: r.admin_reply,
        adminRepliedAt: r.admin_replied_at != null ? r.admin_replied_at.toISOString() : null,
      });
    }
  } catch {
    /* Unknown columns or DB error — leave map empty */
  }
  return map;
}

const baseSelect = {
  id: true,
  subject: true,
  status: true,
  orderId: true,
  createdAt: true,
  lastUpdateAt: true,
} as const;

export type CustomerTicketListRow = {
  id: string;
  shortId: string;
  subject: string;
  status: string;
  orderId: string | null;
  createdAt: string;
  lastUpdateAt: string | null;
  adminReply: string | null;
  adminRepliedAt: string | null;
};

function toRow(
  t: {
    id: string;
    subject: string;
    status: string;
    orderId: string | null;
    createdAt: Date;
    lastUpdateAt: Date | null;
  },
  admin: { adminReply: string | null; adminRepliedAt: string | null }
): CustomerTicketListRow {
  return {
    id: t.id,
    shortId: `#TKT-${t.id.slice(0, 8).toUpperCase()}`,
    subject: t.subject,
    status: t.status,
    orderId: t.orderId,
    createdAt: t.createdAt.toISOString(),
    lastUpdateAt: t.lastUpdateAt?.toISOString() ?? null,
    adminReply: admin.adminReply,
    adminRepliedAt: admin.adminRepliedAt,
  };
}

export async function listCustomerSupportTicketsForUser(
  userId: string,
  status?: SupportTicketStatus
): Promise<CustomerTicketListRow[]> {
  const where: {
    userId: string;
    deletedAt: null;
    status?: SupportTicketStatus;
  } = { userId, deletedAt: null };
  if (status) where.status = status;

  const rows = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: baseSelect,
  });
  const meta = await fetchAdminColumnsForTicketIds(rows.map((r) => r.id));
  return rows.map((t) => toRow(t, meta.get(t.id) ?? { adminReply: null, adminRepliedAt: null }));
}

export async function getOneCustomerSupportTicketForUser(
  userId: string,
  ticketId: string
): Promise<(CustomerTicketListRow & { updatedAt: string }) | null> {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId, deletedAt: null },
    select: { ...baseSelect, updatedAt: true },
  });
  if (!ticket) return null;
  const meta = await fetchAdminColumnsForTicketIds([ticketId]);
  const admin = meta.get(ticketId) ?? { adminReply: null, adminRepliedAt: null };
  const { updatedAt, ...rest } = ticket;
  return { ...toRow(rest, admin), updatedAt: updatedAt.toISOString() };
}
