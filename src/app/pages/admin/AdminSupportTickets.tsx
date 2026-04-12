"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, ChevronDown, ChevronUp } from "lucide-react";

type VendorTicket = {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  createdAt: string;
  sellerName: string;
  sellerEmail: string;
};

type CustomerTicket = {
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
};

type ExpandedKey = `vendor:${string}` | `customer:${string}` | null;

function statusBadgeClass(status: string): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const s = status.toUpperCase();
  if (s === "OPEN") return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`;
  if (s === "IN_PROGRESS") return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-600/20`;
  if (s === "RESOLVED" || s === "CLOSED") return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
  return `${base} bg-slate-100 text-slate-600`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function AdminSupportTickets() {
  const router = useRouter();
  const [vendorTickets, setVendorTickets] = useState<VendorTicket[]>([]);
  const [customerTickets, setCustomerTickets] = useState<CustomerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<ExpandedKey>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("RESOLVED");
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support-tickets", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Failed to load tickets";
        setError(msg);
        setVendorTickets([]);
        setCustomerTickets([]);
        if (res.status === 401 || (res.status === 403 && String(msg).toLowerCase().includes("admin"))) {
          router.replace(`/admin/login?callbackUrl=${encodeURIComponent("/admin/support-tickets")}`);
        }
        return;
      }
      const data = json.data;
      if (Array.isArray(data)) {
        setVendorTickets(data);
        setCustomerTickets([]);
      } else {
        setVendorTickets(data?.vendorTickets ?? []);
        setCustomerTickets(data?.customerTickets ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tickets");
      setVendorTickets([]);
      setCustomerTickets([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmitReply = async (ticketId: string, ticketType: "vendor" | "customer") => {
    if (!replyText.trim()) return;
    setSubmitError(null);
    const key = `${ticketType}:${ticketId}`;
    setSubmittingKey(key);
    try {
      const res = await fetch(`/api/admin/support-tickets/${ticketId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reply: replyText.trim(),
          status: replyStatus,
          ticketType,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(json?.error?.message ?? "Failed to send reply");
        return;
      }
      setReplyText("");
      setExpandedKey(null);
      fetchTickets();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setSubmittingKey(null);
    }
  };

  const renderVendorRows = () => (
    <div className="divide-y divide-slate-200/80">
      {vendorTickets.map((ticket) => {
        const rowKey = `vendor:${ticket.id}` as const;
        const isExpanded = expandedKey === rowKey;
        return (
          <div key={ticket.id} className="px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setExpandedKey(isExpanded ? null : rowKey);
                if (!isExpanded) {
                  setReplyText(ticket.adminReply ?? "");
                  setReplyStatus(ticket.status);
                }
              }}
              className="flex w-full items-center gap-4 text-left"
            >
              <span className="flex-shrink-0 text-slate-400">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{ticket.subject}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ticket.sellerName} · {ticket.sellerEmail} · {ticket.category} · {formatDate(ticket.createdAt)}
                </p>
              </div>
              <span className={statusBadgeClass(ticket.status)}>{ticket.status.replace("_", " ")}</span>
              {ticket.adminReply && (
                <span className="text-xs text-emerald-600 font-medium">Replied</span>
              )}
            </button>

            {isExpanded && (
              <div className="mt-4 pl-9 space-y-4 border-l-2 border-slate-100 ml-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Vendor message</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{ticket.message}</p>
                </div>

                {ticket.adminReply && (
                  <div className="rounded-lg bg-indigo-50/80 p-4">
                    <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider mb-1">
                      Your reply{ticket.adminRepliedAt ? ` · ${formatDate(ticket.adminRepliedAt)}` : ""}
                    </p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{ticket.adminReply}</p>
                  </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reply or solution</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply or solution for the vendor..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSubmitReply(ticket.id, "vendor")}
                      disabled={!replyText.trim() || submittingKey === rowKey}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingKey === rowKey ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCustomerRows = () => (
    <div className="divide-y divide-slate-200/80">
      {customerTickets.map((ticket) => {
        const rowKey = `customer:${ticket.id}` as const;
        const isExpanded = expandedKey === rowKey;
        return (
          <div key={ticket.id} className="px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setExpandedKey(isExpanded ? null : rowKey);
                if (!isExpanded) {
                  setReplyText(ticket.adminReply ?? "");
                  setReplyStatus(ticket.status);
                }
              }}
              className="flex w-full items-center gap-4 text-left"
            >
              <span className="flex-shrink-0 text-slate-400">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{ticket.subject}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ticket.userName} · {ticket.userEmail}
                  {ticket.orderId ? ` · Order ${ticket.orderId.slice(0, 8).toUpperCase()}…` : ""} ·{" "}
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
              <span className={statusBadgeClass(ticket.status)}>{ticket.status.replace("_", " ")}</span>
              {ticket.adminReply && (
                <span className="text-xs text-emerald-600 font-medium">Replied</span>
              )}
            </button>

            {isExpanded && (
              <div className="mt-4 pl-9 space-y-4 border-l-2 border-slate-100 ml-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Customer query</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{ticket.subject}</p>
                </div>

                {ticket.adminReply && (
                  <div className="rounded-lg bg-indigo-50/80 p-4">
                    <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider mb-1">
                      Your reply{ticket.adminRepliedAt ? ` · ${formatDate(ticket.adminRepliedAt)}` : ""}
                    </p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{ticket.adminReply}</p>
                  </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reply or solution</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply for the customer..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSubmitReply(ticket.id, "customer")}
                      disabled={!replyText.trim() || submittingKey === rowKey}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingKey === rowKey ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const emptyVendor = !loading && vendorTickets.length === 0;
  const emptyCustomer = !loading && customerTickets.length === 0;

  return (
    <div className="min-h-full bg-slate-50/80 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Support Tickets</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vendor queries and customer (shopper) support requests in separate sections.
        </p>
      </div>

      {(error || submitError) && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/80 px-6 py-4 text-sm text-rose-700">
          {error ?? submitError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-slate-200/80 bg-white py-16 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/90 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Customer (user) queries</h2>
              <p className="text-sm text-slate-500">Tickets raised from the account Support page.</p>
            </div>
            {emptyCustomer ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">No customer tickets yet.</div>
            ) : (
              renderCustomerRows()
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/90 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Vendor queries</h2>
              <p className="text-sm text-slate-500">Tickets from seller / vendor dashboard support.</p>
            </div>
            {emptyVendor ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">No vendor tickets yet.</div>
            ) : (
              renderVendorRows()
            )}
          </section>
        </div>
      )}
    </div>
  );
}
