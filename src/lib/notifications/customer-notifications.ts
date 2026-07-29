import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotificationMetadata = {
  orderId?: string;
  productId?: string;
  productImageUrl?: string;
  actionHref?: string;
  actionLabel?: string;
};

export type CustomerNotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  orderId: string | null;
  productId: string | null;
  productImageUrl: string | null;
  actionHref: string | null;
  actionLabel: string | null;
};

type PreferenceCategory = "orderUpdates" | "payments" | "offers" | "wishlist" | "security";

const TYPE_TO_PREFERENCE: Partial<Record<NotificationType, PreferenceCategory>> = {
  ORDER: "orderUpdates",
  RETURN: "orderUpdates",
  PAYMENT: "payments",
  SELLER: "offers",
  SYSTEM: "security",
};

function parseMetadata(raw: Prisma.JsonValue | null): NotificationMetadata {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const m = raw as Record<string, unknown>;
  return {
    orderId: typeof m.orderId === "string" ? m.orderId : undefined,
    productId: typeof m.productId === "string" ? m.productId : undefined,
    productImageUrl: typeof m.productImageUrl === "string" ? m.productImageUrl : undefined,
    actionHref: typeof m.actionHref === "string" ? m.actionHref : undefined,
    actionLabel: typeof m.actionLabel === "string" ? m.actionLabel : undefined,
  };
}

export function mapCustomerNotification(n: {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  metadata: Prisma.JsonValue | null;
}): CustomerNotificationRow {
  const meta = parseMetadata(n.metadata);
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    orderId: meta.orderId ?? null,
    productId: meta.productId ?? null,
    productImageUrl: meta.productImageUrl ?? null,
    actionHref: meta.actionHref ?? null,
    actionLabel: meta.actionLabel ?? null,
  };
}

async function isNotificationAllowed(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const prefKey = TYPE_TO_PREFERENCE[type];
  if (!prefKey) return true;

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
    select: {
      orderUpdates: true,
      payments: true,
      offers: true,
      wishlist: true,
      security: true,
    },
  });
  if (!prefs) return true;
  return prefs[prefKey];
}

export async function createCustomerNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
}): Promise<void> {
  const allowed = await isNotificationAllowed(input.userId, input.type);
  if (!allowed) return;

  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title.slice(0, 255),
      message: input.message,
      metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function notifyOrderPlaced(userId: string, orderId: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: "ORDER",
    title: "Order placed",
    message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed successfully.`,
    metadata: {
      orderId,
      actionHref: `/order-detail/${orderId}`,
      actionLabel: "View order",
    },
  });
}

export async function notifyPaymentSuccess(userId: string, orderId: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: "PAYMENT",
    title: "Payment successful",
    message: `Payment for order #${orderId.slice(0, 8).toUpperCase()} was received.`,
    metadata: {
      orderId,
      actionHref: `/order-detail/${orderId}`,
      actionLabel: "View order",
    },
  });
}

export async function notifyPaymentFailed(userId: string, orderId: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: "PAYMENT",
    title: "Payment failed",
    message: `Payment for order #${orderId.slice(0, 8).toUpperCase()} could not be completed. Please try again.`,
    metadata: {
      orderId,
      actionHref: `/order-detail/${orderId}`,
      actionLabel: "Retry payment",
    },
  });
}

export async function notifyOrderShipped(userId: string, orderId: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: "ORDER",
    title: "Order shipped",
    message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been shipped.`,
    metadata: {
      orderId,
      actionHref: `/track-order/${orderId}`,
      actionLabel: "Track order",
    },
  });
}

export async function notifyOrderDelivered(userId: string, orderId: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: "ORDER",
    title: "Order delivered",
    message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been delivered.`,
    metadata: {
      orderId,
      actionHref: `/order-detail/${orderId}`,
      actionLabel: "View order",
    },
  });
}

export async function notifyOrderCancelled(userId: string, orderId: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: "ORDER",
    title: "Order cancelled",
    message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been cancelled.`,
    metadata: {
      orderId,
      actionHref: `/order-detail/${orderId}`,
      actionLabel: "View order",
    },
  });
}

export async function listCustomerNotifications(
  userId: string,
  limit = 50
): Promise<{ notifications: CustomerNotificationRow[]; unreadCount: number }> {
  const where = { userId, deletedAt: null };

  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        readAt: true,
        createdAt: true,
        metadata: true,
      },
    }),
    prisma.notification.count({ where: { ...where, read: false } }),
  ]);

  return {
    notifications: rows.map(mapCustomerNotification),
    unreadCount,
  };
}

export async function markAllCustomerNotificationsRead(userId: string): Promise<number> {
  const now = new Date();
  const result = await prisma.notification.updateMany({
    where: { userId, read: false, deletedAt: null },
    data: { read: true, readAt: now },
  });
  return result.count;
}

export async function markCustomerNotificationRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId, deletedAt: null },
    select: { id: true, read: true },
  });
  if (!notification) return false;
  if (notification.read) return true;

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true, readAt: new Date() },
  });
  return true;
}

export async function deleteCustomerNotification(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!notification) return false;

  await prisma.notification.update({
    where: { id: notificationId },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  });
  return true;
}

export type NotificationPreferencesPayload = {
  orderUpdates: boolean;
  payments: boolean;
  offers: boolean;
  wishlist: boolean;
  security: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferencesPayload = {
  orderUpdates: true,
  payments: true,
  offers: true,
  wishlist: true,
  security: true,
  email: true,
  sms: true,
  push: true,
};

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferencesPayload> {
  const row = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!row) return { ...DEFAULT_PREFERENCES };
  return {
    orderUpdates: row.orderUpdates,
    payments: row.payments,
    offers: row.offers,
    wishlist: row.wishlist,
    security: row.security,
    email: row.email,
    sms: row.sms,
    push: row.push,
  };
}

export async function updateNotificationPreferences(
  userId: string,
  patch: Partial<NotificationPreferencesPayload>
): Promise<NotificationPreferencesPayload> {
  const data = {
    ...(patch.orderUpdates !== undefined ? { orderUpdates: patch.orderUpdates } : {}),
    ...(patch.payments !== undefined ? { payments: patch.payments } : {}),
    ...(patch.offers !== undefined ? { offers: patch.offers } : {}),
    ...(patch.wishlist !== undefined ? { wishlist: patch.wishlist } : {}),
    ...(patch.security !== undefined ? { security: patch.security } : {}),
    ...(patch.email !== undefined ? { email: patch.email } : {}),
    ...(patch.sms !== undefined ? { sms: patch.sms } : {}),
    ...(patch.push !== undefined ? { push: patch.push } : {}),
  };

  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...DEFAULT_PREFERENCES, ...data },
    update: data,
  });

  return getNotificationPreferences(userId);
}
