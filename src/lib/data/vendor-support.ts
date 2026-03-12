import { prisma } from "@/lib/prisma";

export interface VendorSupportTicketItem {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  createdAt: string;
}

export async function createVendorSupportTicket(
  sellerId: string,
  data: { subject: string; category: string; message: string }
): Promise<VendorSupportTicketItem> {
  const ticket = await prisma.vendorSupportTicket.create({
    data: {
      sellerId,
      subject: data.subject.trim(),
      category: data.category.trim(),
      message: data.message.trim(),
      status: "OPEN",
    },
  });
  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    message: ticket.message,
    status: ticket.status,
    adminReply: ticket.adminReply ?? null,
    adminRepliedAt: ticket.adminRepliedAt?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
  };
}

function toTicketItem(t: {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  adminReply?: string | null;
  adminRepliedAt?: Date | null;
  createdAt: Date;
}) {
  return {
    id: t.id,
    subject: t.subject,
    category: t.category,
    message: t.message,
    status: t.status,
    adminReply: t.adminReply ?? null,
    adminRepliedAt: t.adminRepliedAt != null ? (t.adminRepliedAt instanceof Date ? t.adminRepliedAt.toISOString() : null) : null,
    createdAt: t.createdAt.toISOString(),
  };
}

export async function getVendorSupportTickets(
  sellerId: string
): Promise<VendorSupportTicketItem[]> {
  const tickets = await prisma.vendorSupportTicket.findMany({
    where: { sellerId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return tickets.map(toTicketItem);
}

/** List all vendor support tickets for admin (with seller info). */
export interface AdminVendorTicketItem extends VendorSupportTicketItem {
  sellerName: string;
  sellerEmail: string;
}

export async function getAdminVendorSupportTickets(): Promise<AdminVendorTicketItem[]> {
  const tickets = await prisma.vendorSupportTicket.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: { businessName: true, email: true },
      },
    },
  });
  return tickets.map((t) => ({
    ...toTicketItem(t),
    sellerName: t.seller?.businessName ?? "—",
    sellerEmail: t.seller?.email ?? "—",
  }));
}

/** Admin reply to a vendor support ticket; optionally set status. */
export async function setVendorSupportTicketReply(
  ticketId: string,
  data: { reply: string; status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
): Promise<VendorSupportTicketItem | null> {
  const ticket = await prisma.vendorSupportTicket.findFirst({
    where: { id: ticketId, deletedAt: null },
  });
  if (!ticket) return null;
  const updated = await prisma.vendorSupportTicket.update({
    where: { id: ticketId },
    data: {
      adminReply: data.reply.trim(),
      adminRepliedAt: new Date(),
      ...(data.status && { status: data.status }),
    },
  });
  return toTicketItem(updated);
}
