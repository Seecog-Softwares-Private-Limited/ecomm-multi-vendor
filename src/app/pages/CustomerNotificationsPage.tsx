"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Info,
  Package,
  CreditCard,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/AccountLayout";

type NotificationType = "SYSTEM" | "ORDER" | "SELLER" | "PAYMENT" | "RETURN";

type CustomerNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  orderId: string | null;
  actionHref: string | null;
  actionLabel: string | null;
};

function iconForType(type: NotificationType) {
  switch (type) {
    case "ORDER":
    case "RETURN":
      return ShoppingBag;
    case "PAYMENT":
      return CreditCard;
    case "SELLER":
      return Package;
    default:
      return Info;
  }
}

function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function CustomerNotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=100", {
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/login?returnUrl=" + encodeURIComponent("/notifications"));
        return;
      }
      if (!res.ok) {
        toast.error("Could not load notifications.");
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data?.data?.notifications) ? data.data.notifications : []);
      setUnreadCount(
        typeof data?.data?.unreadCount === "number" ? data.data.unreadCount : 0
      );
    } catch {
      toast.error("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.read);
    return items;
  }, [filter, items]);

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) return;
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Could not mark all as read.");
        return;
      }
      setItems((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <AccountLayout>
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF6A00]" />
            <h1 className="text-lg font-bold text-[#111827]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF4EC] text-[#FF6A00]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:border-[#FF6A00] hover:text-[#FF6A00]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={markingAll}
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#FF6A00] rounded-lg hover:bg-[#E55F00] disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                {markingAll ? "Updating…" : "Mark all read"}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 px-4 sm:px-6 py-3 border-b border-[#F3F4F6]">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${
                filter === f
                  ? "bg-[#FFF4EC] text-[#FF6A00]"
                  : "text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6B7280]">Loading notifications…</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center px-6">
            <Bell className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="font-semibold text-[#111827]">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-sm text-[#6B7280] mt-1">
              Order and payment updates will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {visible.map((n) => {
              const Icon = iconForType(n.type);
              const href =
                n.actionHref ||
                (n.orderId ? `/order-detail/${n.orderId}` : null);
              return (
                <li
                  key={n.id}
                  className={`px-4 sm:px-6 py-4 ${n.read ? "bg-white" : "bg-[#FFFBF7]"}`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        n.read ? "bg-[#F3F4F6] text-[#6B7280]" : "bg-[#FFF4EC] text-[#FF6A00]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-[#111827] text-[15px]">{n.title}</p>
                        <span className="text-xs text-[#9CA3AF] shrink-0">
                          {formatRelative(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] mt-1 whitespace-pre-wrap">{n.message}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {href && (
                          <Link
                            href={href}
                            onClick={() => {
                              if (!n.read) void markRead(n.id);
                            }}
                            className="text-sm font-semibold text-[#FF6A00] hover:underline"
                          >
                            {n.actionLabel || "View details"}
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => void markRead(n.id)}
                            className="text-sm font-medium text-[#6B7280] hover:text-[#111827]"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AccountLayout>
  );
}
