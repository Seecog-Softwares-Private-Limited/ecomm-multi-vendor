import { prisma } from "@/lib/prisma";

export interface VendorSupportTicketItem {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
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
    createdAt: ticket.createdAt.toISOString(),
  };
}

export async function getVendorSupportTickets(
  sellerId: string
): Promise<VendorSupportTicketItem[]> {
  const tickets = await prisma.vendorSupportTicket.findMany({
    where: { sellerId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    category: t.category,
    message: t.message,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));
}
