"use client";

import {
  Bell,
  Check,
  Package,
  DollarSign,
  AlertCircle,
  Info,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { Card, Button } from "../components/UIComponents";
import { vendorService } from "@/services/vendor.service";
import type { VendorNotificationItem, VendorNotificationType } from "@/services/types/vendor.types";
import * as React from "react";
import Link from "next/link";

// ─── helpers ─────────────────────────────────────────────────────────────────

function notificationMeta(type: VendorNotificationType): {
  icon: React.ElementType;
  color: string;
} {
  switch (type) {
    case "ORDER":
      return { icon: ShoppingBag, color: "text-blue-600 bg-blue-100" };
    case "PAYMENT":
      return { icon: DollarSign, color: "text-green-600 bg-green-100" };
    case "RETURN":
      return { icon: Package, color: "text-orange-600 bg-orange-100" };
    case "SELLER":
      return { icon: AlertCircle, color: "text-purple-600 bg-purple-100" };
    case "SYSTEM":
    default:
      return { icon: Info, color: "text-blue-600 bg-blue-100" };
  }
}

function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export function VendorNotifications() {
  const [notifications, setNotifications] = React.useState<VendorNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");
  const [markingAll, setMarkingAll] = React.useState(false);
  const [markingId, setMarkingId] = React.useState<string | null>(null);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorService.getNotifications({ limit: 100 });
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await vendorService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* silent */
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await vendorService.markAllNotificationsRead();
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: now })));
      setUnreadCount(0);
    } catch {
      /* silent */
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const readCount = notifications.length - unreadCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/vendor"
              className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Notifications</h1>
          <p className="text-[#64748B] mt-1">
            {loading ? "Loading…" : `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={handleMarkAllRead} disabled={markingAll}>
              <Check className="w-4 h-4" />
              {markingAll ? "Marking…" : "Mark All as Read"}
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={fetchNotifications} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && !error && (
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { key: "all", label: `All (${notifications.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "read", label: `Read (${readCount})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === key
                  ? "bg-[#3B82F6] text-white shadow-md"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#3B82F6] hover:text-[#3B82F6]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/5 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-[#94A3B8]" />
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications"}
                </h3>
                <p className="text-[#64748B]">
                  {filter === "unread" ? "You're all caught up!" : "Nothing to show here yet."}
                </p>
              </div>
            </Card>
          ) : (
            filtered.map((n) => {
              const { icon: Icon, color } = notificationMeta(n.type);
              return (
                <div
                  key={n.id}
                  className={`rounded-2xl border bg-white p-5 transition-colors ${
                    n.read ? "border-[#E2E8F0]" : "border-[#BFDBFE] bg-blue-50/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 ${color} rounded-full flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold text-sm leading-snug ${
                            n.read ? "text-[#64748B]" : "text-[#1E293B]"
                          }`}
                        >
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-[#64748B] leading-relaxed">{n.message}</p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                        <span className="text-xs text-[#94A3B8]">{formatRelative(n.createdAt)}</span>
                        {!n.read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            disabled={markingId === n.id}
                            className="text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB] disabled:opacity-50 transition-colors"
                          >
                            {markingId === n.id ? "Marking…" : "Mark as read"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
