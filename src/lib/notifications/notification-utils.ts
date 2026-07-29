import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Info,
  Package,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

/** Matches Prisma NotificationType */
export type NotificationType = "SYSTEM" | "ORDER" | "SELLER" | "PAYMENT" | "RETURN";

export type NotificationCategory =
  | "all"
  | "orders"
  | "payments"
  | "wishlist"
  | "offers"
  | "account"
  | "system";

export type CustomerNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  /** Future API fields */
  orderId?: string | null;
  productId?: string | null;
  productImageUrl?: string | null;
  actionHref?: string | null;
  actionLabel?: string | null;
};

export type NotificationFilter = "all" | "unread" | "read";

export const BACKEND_NOTIFICATION_TYPES: NotificationType[] = [
  "SYSTEM",
  "ORDER",
  "PAYMENT",
  "RETURN",
  "SELLER",
];

/** Category tabs — hide ones with no backend type mapping */
export const NOTIFICATION_CATEGORIES: {
  id: NotificationCategory;
  label: string;
  supported: boolean;
}[] = [
  { id: "all", label: "All", supported: true },
  { id: "orders", label: "Orders", supported: true },
  { id: "payments", label: "Payments", supported: true },
  { id: "system", label: "System", supported: true },
  { id: "wishlist", label: "Wishlist", supported: false },
  { id: "offers", label: "Offers", supported: false },
  { id: "account", label: "Account", supported: false },
];

export function notificationIcon(type: NotificationType): {
  Icon: LucideIcon;
  className: string;
  emoji: string;
} {
  switch (type) {
    case "ORDER":
      return { Icon: Package, className: "bg-blue-100 text-blue-700", emoji: "📦" };
    case "PAYMENT":
      return { Icon: CreditCard, className: "bg-emerald-100 text-emerald-700", emoji: "💳" };
    case "RETURN":
      return { Icon: RotateCcw, className: "bg-orange-100 text-orange-700", emoji: "↩️" };
    case "SELLER":
      return { Icon: ShoppingBag, className: "bg-purple-100 text-purple-700", emoji: "🏪" };
    case "SYSTEM":
    default:
      return { Icon: Info, className: "bg-slate-100 text-slate-700", emoji: "🔔" };
  }
}

export function matchesCategory(n: CustomerNotification, category: NotificationCategory): boolean {
  if (category === "all") return true;
  if (category === "orders") return n.type === "ORDER" || n.type === "RETURN";
  if (category === "payments") return n.type === "PAYMENT";
  if (category === "system") return n.type === "SYSTEM" || n.type === "SELLER";
  return false;
}

export function formatNotificationTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

export function searchNotifications(
  list: CustomerNotification[],
  query: string
): CustomerNotification[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.orderId?.toLowerCase().includes(q) ?? false)
  );
}

export function filterNotifications(
  list: CustomerNotification[],
  filter: NotificationFilter,
  category: NotificationCategory
): CustomerNotification[] {
  return list.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (!matchesCategory(n, category)) return false;
    return true;
  });
}

export function sortNotificationsNewest(list: CustomerNotification[]): CustomerNotification[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Infer navigation from message/title when API has no actionHref */
export function inferNotificationHref(n: CustomerNotification): string | null {
  if (n.actionHref) return n.actionHref;
  if (n.orderId) return `/order-detail/${n.orderId}`;
  if (n.productId) return `/product/${n.productId}`;
  const lower = `${n.title} ${n.message}`.toLowerCase();
  if (lower.includes("wishlist")) return "/wishlist";
  if (lower.includes("support") || lower.includes("ticket")) return "/support-tickets";
  if (lower.includes("order")) return "/my-orders";
  return null;
}

export const PREFERENCE_TOGGLES = [
  { id: "orders", label: "Order Updates", supported: true },
  { id: "payments", label: "Payments", supported: true },
  { id: "offers", label: "Offers & Promotions", supported: true },
  { id: "wishlist", label: "Wishlist Alerts", supported: true },
  { id: "security", label: "Security", supported: true },
  { id: "push", label: "Push Notifications", supported: true },
  { id: "email", label: "Email Notifications", supported: true },
  { id: "sms", label: "SMS Notifications", supported: true },
] as const;
