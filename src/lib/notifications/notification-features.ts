/**
 * Customer notification capability map — from backend inspection.
 *
 * Database (`Notification` model): userId, type, title, message, read, readAt, createdAt
 * Types: SYSTEM | ORDER | SELLER | PAYMENT | RETURN
 *
 * Customer APIs: NONE (vendor/admin only today)
 *   GET  /api/vendor/notifications
 *   PATCH /api/vendor/notifications, /api/vendor/notifications/[id]
 *
 * Push: no FCM / OneSignal / Web Push / SSE found
 * Preferences: no customer settings API found
 */
export const NOTIFICATION_FEATURES = {
  listNotifications: true,
  unreadCount: true,
  markRead: true,
  markAllRead: true,
  deleteNotification: true,
  serverPagination: false,
  serverTypeFilter: false,
  preferences: true,
  pushNotifications: false,
  productThumbnail: false,
  orderMetadata: false,
  deepLinks: false,
  /** Client-side search/filter when notifications are loaded */
  clientSearch: true,
  clientFilter: true,
} as const;

/** Expected customer API paths — wire hook when backend ships */
export const NOTIFICATION_API = {
  list: "/api/notifications",
  markAllRead: "/api/notifications",
  markRead: (id: string) => `/api/notifications/${encodeURIComponent(id)}`,
  delete: (id: string) => `/api/notifications/${encodeURIComponent(id)}`,
} as const;
