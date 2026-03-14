"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Clock } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { toast } from "sonner";

type Ticket = {
  id: string;
  shortId: string;
  subject: string;
  status: string;
  orderId: string | null;
  createdAt: string;
  lastUpdateAt: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-amber-500 text-white",
  IN_PROGRESS: "bg-blue-500 text-white",
  RESOLVED: "bg-emerald-600 text-white",
  CLOSED: "bg-slate-500 text-white",
};

const FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const;

function formatDate(iso: string) {
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

function formatRelative(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
}

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback((status?: string) => {
    const url =
      status && status !== "ALL"
        ? `/api/support-tickets?status=${encodeURIComponent(status)}`
        : "/api/support-tickets";
    return fetch(url, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        if (data?.data?.tickets) setTickets(data.data.tickets);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchTickets(statusFilter === "ALL" ? undefined : statusFilter);
  }, [statusFilter, fetchTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const subject = newSubject.trim();
    if (!subject) {
      toast.error("Please enter a subject");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to create ticket");
        return;
      }
      toast.success("Support ticket created");
      setNewSubject("");
      setNewTicketOpen(false);
      setLoading(true);
      setError(false);
      fetchTickets(statusFilter === "ALL" ? undefined : statusFilter);
    } catch {
      toast.error("Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets =
    statusFilter === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Support Tickets</h1>
            <p className="text-slate-600">Manage your support requests</p>
          </div>
          <button
            type="button"
            onClick={() => setNewTicketOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        </div>

        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-5 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                statusFilter === f
                  ? "bg-[#FF6A00] text-white"
                  : "border-2 border-slate-200 text-slate-700 hover:border-[#FF6A00] hover:text-[#FF6A00]"
              }`}
            >
              {f === "ALL" ? "All Tickets" : STATUS_LABELS[f] ?? f}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">
            Loading tickets…
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-600 font-medium">
            Failed to load tickets. Please try again.
          </div>
        )}

        {!loading && !error && filteredTickets.length === 0 && (
          <div className="py-12 text-center text-slate-600">
            <p className="font-medium">
              {statusFilter === "ALL"
                ? "You have no support tickets yet."
                : `No ${STATUS_LABELS[statusFilter] ?? statusFilter.toLowerCase()} tickets.`}
            </p>
            {statusFilter === "ALL" && (
              <button
                type="button"
                onClick={() => setNewTicketOpen(true)}
                className="mt-4 inline-block px-6 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00]"
              >
                Create a ticket
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredTickets.length > 0 && (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-slate-500 font-semibold">
                        {ticket.shortId}
                      </span>
                      <span
                        className={`${
                          STATUS_COLORS[ticket.status] ?? "bg-slate-500 text-white"
                        } px-3 py-1 rounded-lg text-sm font-bold`}
                      >
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatRelative(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailTicket(ticket)}
                    className="px-5 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#FF6A00] hover:text-[#FF6A00] rounded-xl font-semibold transition-colors shrink-0"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-[#FF6A00] to-[#E55F00] rounded-2xl p-6 sm:p-8 text-white">
          <h3 className="text-xl font-bold mb-2">Need Help?</h3>
          <p className="mb-4 text-white/90">
            Check out our help center for frequently asked questions and quick solutions.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-white text-[#FF6A00] rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Visit Help Center
          </Link>
        </div>
      </div>

      {newTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-6">New Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  maxLength={500}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setNewTicketOpen(false); setNewSubject(""); }}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] disabled:opacity-70"
                >
                  {submitting ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-6">Ticket Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-semibold text-gray-500">ID</dt>
                <dd className="text-[#111827] font-medium">{detailTicket.shortId}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-500">Subject</dt>
                <dd className="text-[#111827] font-medium">{detailTicket.subject}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-block ${
                      STATUS_COLORS[detailTicket.status] ?? "bg-slate-500 text-white"
                    } px-3 py-1 rounded-lg text-sm font-bold`}
                  >
                    {STATUS_LABELS[detailTicket.status] ?? detailTicket.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-500">Created</dt>
                <dd className="text-[#111827]">{formatDate(detailTicket.createdAt)}</dd>
              </div>
              {detailTicket.lastUpdateAt && (
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Last update</dt>
                  <dd className="text-[#111827]">{formatDate(detailTicket.lastUpdateAt)}</dd>
                </div>
              )}
              {detailTicket.orderId && (
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Related order</dt>
                  <dd>
                    <Link
                      href={`/order-detail/${detailTicket.orderId}`}
                      className="text-[#FF6A00] font-medium hover:underline"
                    >
                      View order #{detailTicket.orderId.slice(0, 8).toUpperCase()}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setDetailTicket(null)}
                className="w-full px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
