import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchAdminColumnsForTicketIds } from "@/lib/data/support-ticket-customer-read";
import { sanitizePlainText } from "@/lib/text-sanitize";

export type SupportMessageRow = {
  id: string;
  author: "CUSTOMER" | "ADMIN";
  body: string;
  createdAt: string;
  authorName: string;
};

export async function appendSupportTicketMessage(input: {
  ticketId: string;
  authorType: "CUSTOMER" | "ADMIN";
  body: string;
  userId?: string | null;
  adminId?: string | null;
  tx?: Prisma.TransactionClient;
}): Promise<void> {
  const client = input.tx ?? prisma;
  const safeBody = sanitizePlainText(input.body, 5000);
  if (!safeBody) return;

  await client.supportTicketMessage.create({
    data: {
      ticketId: input.ticketId,
      authorType: input.authorType,
      body: safeBody,
      userId: input.userId ?? null,
      adminId: input.adminId ?? null,
    },
  });

  await client.supportTicket.update({
    where: { id: input.ticketId },
    data: { lastUpdateAt: new Date(), updatedAt: new Date() },
  });
}

export async function getSupportTicketMessagesForCustomer(
  userId: string,
  ticketId: string
): Promise<SupportMessageRow[] | null> {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId, deletedAt: null },
    select: {
      id: true,
      subject: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });
  if (!ticket) return null;

  const [messages, adminMeta] = await Promise.all([
    prisma.supportTicketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        authorType: true,
        body: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
        admin: { select: { name: true, email: true } },
      },
    }),
    fetchAdminColumnsForTicketIds([ticketId]),
  ]);

  const customerName =
    [ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(" ") || "You";

  const rows: SupportMessageRow[] = [];

  if (messages.length === 0) {
    rows.push({
      id: `ticket-open-${ticket.id}`,
      author: "CUSTOMER",
      body: ticket.subject,
      createdAt: ticket.createdAt.toISOString(),
      authorName: customerName,
    });

    const legacy = adminMeta.get(ticketId);
    if (legacy?.adminReply) {
      rows.push({
        id: `legacy-admin-${ticket.id}`,
        author: "ADMIN",
        body: legacy.adminReply,
        createdAt: legacy.adminRepliedAt ?? ticket.createdAt.toISOString(),
        authorName: "Support team",
      });
    }
    return rows;
  }

  for (const m of messages) {
    const authorName =
      m.authorType === "CUSTOMER"
        ? [m.user?.firstName, m.user?.lastName].filter(Boolean).join(" ") || customerName
        : m.admin?.name?.trim() || m.admin?.email || "Support team";

    rows.push({
      id: m.id,
      author: m.authorType,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      authorName,
    });
  }

  return rows;
}

export async function addCustomerSupportTicketReply(
  userId: string,
  ticketId: string,
  message: string
): Promise<SupportMessageRow[] | null> {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId, deletedAt: null },
    select: { id: true, status: true },
  });
  if (!ticket) return null;
  if (ticket.status === "CLOSED") return null;

  await appendSupportTicketMessage({
    ticketId,
    authorType: "CUSTOMER",
    body: message,
    userId,
  });

  if (ticket.status === "RESOLVED") {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "OPEN", updatedAt: new Date() },
    });
  }

  return getSupportTicketMessagesForCustomer(userId, ticketId);
}
