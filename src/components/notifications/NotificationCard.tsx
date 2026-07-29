"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { NOTIFICATION_FEATURES } from "@/lib/notifications/notification-features";
import {
  formatNotificationTime,
  inferNotificationHref,
  notificationIcon,
  type CustomerNotification,
} from "@/lib/notifications/notification-utils";

type NotificationCardProps = {
  notification: CustomerNotification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
};

function NotificationCardInner({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const router = useRouter();
  const { Icon, className, emoji } = notificationIcon(notification.type);
  const href = NOTIFICATION_FEATURES.deepLinks ? inferNotificationHref(notification) : null;
  const showThumb =
    NOTIFICATION_FEATURES.productThumbnail && Boolean(notification.productImageUrl);

  const handleActivate = useCallback(() => {
    if (NOTIFICATION_FEATURES.markRead && !notification.read) {
      onMarkRead?.(notification.id);
    }
    if (href) router.push(href);
  }, [notification, onMarkRead, href, router]);

  const content = (
    <>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </div>

      {showThumb && notification.productImageUrl && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200">
          <ProductImage
            src={notification.productImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-bold sm:text-base ${
              notification.read ? "text-slate-700" : "text-slate-900"
            }`}
          >
            <span className="mr-1.5" aria-hidden>{emoji}</span>
            {notification.title}
          </p>
          {!notification.read && (
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--iv-brand)]"
              aria-label="Unread"
            />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <time className="text-xs text-slate-500" dateTime={notification.createdAt}>
            {formatNotificationTime(notification.createdAt)}
          </time>
          {notification.orderId && NOTIFICATION_FEATURES.orderMetadata && (
            <span className="font-mono text-xs text-slate-500">
              #{notification.orderId.slice(0, 8).toUpperCase()}
            </span>
          )}
        </div>
        {href && notification.actionLabel && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--iv-brand)]">
            {notification.actionLabel}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
    </>
  );

  const cardClass = `iv-enter iv-card flex w-full gap-3 p-4 text-left transition sm:p-5 ${
    notification.read
      ? "border-slate-200/80 bg-white"
      : "border-[var(--iv-brand)]/20 bg-[var(--iv-brand-muted)]/40 shadow-sm"
  }`;

  return (
    <article aria-label={`${notification.read ? "" : "Unread: "}${notification.title}`}>
      <div className="flex items-stretch gap-2">
        {href ? (
          <button
            type="button"
            onClick={handleActivate}
            className={`${cardClass} flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]`}
          >
            {content}
          </button>
        ) : (
          <div className={`${cardClass} flex-1`}>{content}</div>
        )}

        {NOTIFICATION_FEATURES.deleteNotification && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(notification.id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label={`Delete notification: ${notification.title}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {href && !notification.actionLabel && (
        <Link
          href={href}
          className="sr-only"
          onClick={() => {
            if (NOTIFICATION_FEATURES.markRead && !notification.read) onMarkRead?.(notification.id);
          }}
        >
          Open related page
        </Link>
      )}
    </article>
  );
}

export const NotificationCard = memo(NotificationCardInner, (a, b) => a.notification.id === b.notification.id && a.notification.read === b.notification.read);
