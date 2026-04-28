"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, Bell, X, ChevronLeft, ChevronRight, Trash2, Check } from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

const PAGE_SIZE = 10;

const typeColors: Record<string, string> = {
  System: "bg-slate-100 text-slate-700 ring-slate-200",
  Order: "bg-amber-50 text-amber-800 ring-amber-200",
  Seller: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Payment: "bg-blue-50 text-blue-800 ring-blue-200",
  Return: "bg-rose-50 text-rose-800 ring-rose-200",
};

function typeToDisplay(type: string): string {
  if (!type) return "System";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20";
const labelBase = "block text-sm font-medium text-slate-700 mb-1.5";

export function NotificationsManagement() {
  const [showModal, setShowModal] = useState(false);
  const [sendType, setSendType] = useState("system");
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendTarget, setSendTarget] = useState("all_sellers");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [broadcastInfo, setBroadcastInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages) || 1;

  const fetchNotifications = useCallback(
    async (overridePage?: number) => {
      setLoading(true);
      setError(null);
      const currentPage = overridePage ?? page;
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("pageSize", String(PAGE_SIZE));
    if (typeFilter) params.set("type", typeFilter);
    if (readFilter) params.set("read", readFilter);
    try {
      const res = await fetch(`/api/admin/notifications?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Failed to load notifications");
        return;
      }
      if (json.success && json.data) {
        const list = (json.data.notifications ?? []).map((n: { id: string; type: string; title: string; message: string; date: string; read: boolean }) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          date: n.date,
          read: n.read,
        }));
        setNotifications(list);
        const meta = json.meta as { total?: number } | undefined;
        setTotal(meta?.total ?? 0);
      }
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  },
    [page, typeFilter, readFilter]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleApplyFilters = () => {
    setPage(1);
  };

  const resetSendForm = () => {
    setSendType("system");
    setSendTitle("");
    setSendMessage("");
    setSendTarget("all_sellers");
    setSendError(null);
  };

  const openSendModal = () => {
    resetSendForm();
    setShowModal(true);
  };

  const closeSendModal = () => {
    setShowModal(false);
    resetSendForm();
  };

  const handleSendNotification = async () => {
    setSendError(null);
    const title = sendTitle.trim();
    const message = sendMessage.trim();
    if (!title) {
      setSendError("Please enter a title.");
      return;
    }
    if (!message) {
      setSendError("Please enter a message.");
      return;
    }
    setSendLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: sendType,
          title,
          message,
          target: sendTarget,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSendError(
          json?.error?.message ?? "Could not send notification. Try again."
        );
        return;
      }
      const sent = json?.data?.sent ?? 0;
      closeSendModal();
      setBroadcastInfo(
        sent === 0
          ? "No recipients were found for this target."
          : `Notification sent to ${sent} recipient${sent === 1 ? "" : "s"}.`
      );
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSendLoading(false);
    }
  };

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          if (notifications.length === 1 && page > 1) {
            setPage((p) => Math.max(1, p - 1));
            fetchNotifications(1);
          } else {
            fetchNotifications(page);
          }
        }
      } catch {
        // ignore
      }
    },
    [notifications.length, page, fetchNotifications]
  );

  const startItem = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage system notifications and announcements
            </p>
          </div>
          <button
            type="button"
            onClick={openSendModal}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <Send className="h-4 w-4" />
            Send Notification
          </button>
        </div>

        {broadcastInfo && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <span>{broadcastInfo}</span>
            <button
              type="button"
              onClick={() => setBroadcastInfo(null)}
              className="shrink-0 text-emerald-700 underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Types</option>
              <option value="system">System</option>
              <option value="order">Order</option>
              <option value="seller">Seller</option>
              <option value="payment">Payment</option>
              <option value="return">Return</option>
            </select>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Status</option>
              <option value="true">Read</option>
              <option value="false">Unread</option>
            </select>
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="rounded-xl border border-amber-600 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
          <ul className="divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <li className="px-6 py-12 text-center text-sm text-slate-500">
                Loading…
              </li>
            ) : notifications.length === 0 ? (
              <li className="px-6 py-12 text-center text-sm text-slate-500">
                No notifications to show.
              </li>
            ) : (
              notifications.map((notification) => {
                const typeDisplayLabel = typeToDisplay(notification.type);
                return (
                  <li
                    key={notification.id}
                    className={`transition ${!notification.read ? "bg-amber-50/50" : "bg-white hover:bg-slate-50/50"}`}
                  >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                              typeColors[typeDisplayLabel] ?? "bg-slate-100 text-slate-700 ring-slate-200"
                            }`}
                          >
                            {typeDisplayLabel}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                          )}
                        </div>
                        <h3
                          className={`text-base font-semibold ${
                            notification.read ? "text-slate-600" : "text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-600">{notification.message}</p>
                        <p className="mt-2 text-xs text-slate-400">{notification.date}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(notification.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
                <span className="font-medium text-slate-700">{endItem}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> notifications
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1 || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 ${
                      p === safePage
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={p === safePage ? "page" : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Bell className="h-5 w-5" />
                </div>
                <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                  Send Notification
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSendModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sendError && (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {sendError}
              </div>
            )}
            <div className="space-y-5 px-6 py-6">
              <div>
                <label className={labelBase}>Type</label>
                <select
                  className={inputBase}
                  value={sendType}
                  onChange={(e) => setSendType(e.target.value)}
                >
                  <option value="system">System</option>
                  <option value="order">Order</option>
                  <option value="seller">Seller</option>
                  <option value="payment">Payment</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div>
                <label className={labelBase}>Title</label>
                <input
                  type="text"
                  value={sendTitle}
                  onChange={(e) => setSendTitle(e.target.value)}
                  placeholder="Notification title"
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Message</label>
                <textarea
                  rows={4}
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  placeholder="Notification message"
                  className={inputBase + " resize-y min-h-[100px]"}
                />
              </div>
              <div>
                <label className={labelBase}>Target Users</label>
                <select
                  className={inputBase}
                  value={sendTarget}
                  onChange={(e) => setSendTarget(e.target.value)}
                >
                  <option value="all_users">All Users</option>
                  <option value="all_sellers">All Sellers</option>
                  <option value="all_customers">All Customers</option>
                  <option value="all_admins">All Admins</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={closeSendModal}
                disabled={sendLoading}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={sendLoading}
                className="flex-1 rounded-xl border border-amber-600 bg-amber-500 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {sendLoading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
