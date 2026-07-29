export type SupportTicketRow = {
  id: string;
  shortId: string;
  subject: string;
  status: string;
  orderId: string | null;
  createdAt: string;
  lastUpdateAt: string | null;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  updatedAt?: string;
};

export type SupportView = "home" | "faq" | "tickets" | "contact" | "detail";

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-900 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-900 border-blue-200",
  RESOLVED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

export const TICKET_FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type TicketFilter = (typeof TICKET_FILTERS)[number];

export function formatSupportDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatSupportDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
}

export function filterTicketsBySearch(tickets: SupportTicketRow[], query: string): SupportTicketRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return tickets;
  return tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(q) ||
      t.shortId.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
  );
}
