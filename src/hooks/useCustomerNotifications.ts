"use client";

import { useCallback, useEffect, useState } from "react";
import {
  NOTIFICATION_API,
  NOTIFICATION_FEATURES,
} from "@/lib/notifications/notification-features";
import type { CustomerNotification } from "@/lib/notifications/notification-utils";

type UseCustomerNotificationsResult = {
  notifications: CustomerNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  apiAvailable: boolean;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
};

function normalizeNotification(raw: Record<string, unknown>): CustomerNotification {
  return {
    id: String(raw.id ?? ""),
    type: (raw.type as CustomerNotification["type"]) ?? "SYSTEM",
    title: String(raw.title ?? ""),
    message: String(raw.message ?? ""),
    read: Boolean(raw.read),
    readAt: typeof raw.readAt === "string" ? raw.readAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    orderId: typeof raw.orderId === "string" ? raw.orderId : null,
    productId: typeof raw.productId === "string" ? raw.productId : null,
    productImageUrl: typeof raw.productImageUrl === "string" ? raw.productImageUrl : null,
    actionHref: typeof raw.actionHref === "string" ? raw.actionHref : null,
    actionLabel: typeof raw.actionLabel === "string" ? raw.actionLabel : null,
  };
}

export function useCustomerNotifications(enabled: boolean): UseCustomerNotificationsResult {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(enabled && NOTIFICATION_FEATURES.listNotifications);
  const [error, setError] = useState<string | null>(null);
  const apiAvailable = NOTIFICATION_FEATURES.listNotifications;

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !NOTIFICATION_FEATURES.listNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${NOTIFICATION_API.list}?limit=100`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setError(data?.error?.message ?? "Could not load notifications.");
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      const list = Array.isArray(data?.data?.notifications)
        ? data.data.notifications.map((n: Record<string, unknown>) => normalizeNotification(n))
        : [];
      setNotifications(list);
      setUnreadCount(
        typeof data?.data?.unreadCount === "number"
          ? data.data.unreadCount
          : list.filter((n) => !n.read).length
      );
    } catch {
      setError("Network error. Check your connection and try again.");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!NOTIFICATION_FEATURES.markRead) return;
    const res = await fetch(NOTIFICATION_API.markRead(id), {
      method: "PATCH",
      credentials: "include",
    });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!NOTIFICATION_FEATURES.markAllRead) return;
    const res = await fetch(NOTIFICATION_API.markAllRead, {
      method: "PATCH",
      credentials: "include",
    });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    if (!NOTIFICATION_FEATURES.deleteNotification) return;
    const res = await fetch(NOTIFICATION_API.delete(id), {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    apiAvailable,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
