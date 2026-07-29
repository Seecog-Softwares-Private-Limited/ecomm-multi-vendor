"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupportTicketRow, TicketFilter } from "@/lib/support/support-utils";

export function useSupportTickets(enabled: boolean, statusFilter: TicketFilter) {
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!enabled) {
      setTickets([]);
      setLoading(false);
      return;
    }

    const url =
      statusFilter !== "ALL"
        ? `/api/support-tickets?status=${encodeURIComponent(statusFilter)}`
        : "/api/support-tickets";

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        const msg =
          data?.error?.message ??
          (res.status === 401
            ? "Please sign in to view your tickets."
            : `Could not load tickets (${res.status}).`);
        setError(msg);
        setTickets([]);
        return;
      }
      setTickets(Array.isArray(data?.data?.tickets) ? data.data.tickets : []);
    } catch {
      setError("Network error. Check your connection and try again.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, statusFilter]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refetch: fetchTickets };
}

export async function fetchSupportTicketDetail(id: string): Promise<SupportTicketRow | null> {
  const res = await fetch(`/api/support-tickets/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.data?.ticket) return null;
  return data.data.ticket as SupportTicketRow;
}

export async function createSupportTicket(payload: {
  subject: string;
  orderId?: string | null;
}): Promise<{ ok: true; ticket: SupportTicketRow } | { ok: false; message: string }> {
  const res = await fetch("/api/support-tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: data?.error?.message ?? "Failed to create ticket" };
  }
  return { ok: true, ticket: data.data.ticket };
}
