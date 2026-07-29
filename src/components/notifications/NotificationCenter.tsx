"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCheck, Search, Settings } from "lucide-react";
import { useCustomerNotifications } from "@/hooks/useCustomerNotifications";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import {
  NotificationEmptyState,
  NotificationSearchEmptyState,
  NotificationUnavailableState,
} from "@/components/notifications/NotificationEmptyStates";
import { NotificationListSkeleton } from "@/components/notifications/NotificationSkeletons";
import { NOTIFICATION_FEATURES } from "@/lib/notifications/notification-features";
import {
  filterNotifications,
  NOTIFICATION_CATEGORIES,
  PREFERENCE_TOGGLES,
  searchNotifications,
  sortNotificationsNewest,
  type NotificationCategory,
  type NotificationFilter,
} from "@/lib/notifications/notification-utils";

type NotificationCenterProps = {
  isLoggedIn: boolean;
};

const PAGE_SIZE = 12;

function NotificationCenterInner({ isLoggedIn }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    apiAvailable,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useCustomerNotifications(isLoggedIn);

  const [category, setCategory] = useState<NotificationCategory>("all");
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showPrefs, setShowPrefs] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const processed = useMemo(() => {
    let list = filterNotifications(notifications, filter, category);
    if (NOTIFICATION_FEATURES.clientSearch) list = searchNotifications(list, search);
    return sortNotificationsNewest(list);
  }, [notifications, filter, category, search]);

  const visible = useMemo(() => processed.slice(0, visibleCount), [processed, visibleCount]);
  const hasMore = visibleCount < processed.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, category, search]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, processed.length]);

  const handleMarkAll = useCallback(() => void markAllAsRead(), [markAllAsRead]);

  if (!isLoggedIn) {
    return (
      <div className="iv-card py-12 text-center">
        <p className="font-medium text-slate-800">Sign in to view notifications</p>
        <a href="/login?returnUrl=%2Fnotifications" className="iv-btn-primary mt-4 inline-flex">
          Sign in
        </a>
      </div>
    );
  }

  const showUnavailable = !apiAvailable && !loading;
  const showEmpty = apiAvailable && !loading && !error && processed.length === 0;
  const showSearchEmpty =
    apiAvailable && !loading && !error && processed.length === 0 && search.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            {NOTIFICATION_FEATURES.unreadCount && unreadCount > 0
              ? `${unreadCount} unread`
              : "Stay updated on orders and account activity"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_FEATURES.markAllRead && unreadCount > 0 && (
            <button type="button" onClick={handleMarkAll} className="iv-btn-ghost">
              <CheckCheck className="h-4 w-4" aria-hidden />
              Mark all read
            </button>
          )}
          {NOTIFICATION_FEATURES.preferences && (
            <button
              type="button"
              onClick={() => setShowPrefs((v) => !v)}
              className="iv-btn-ghost"
              aria-expanded={showPrefs}
            >
              <Settings className="h-4 w-4" aria-hidden />
              Preferences
            </button>
          )}
        </div>
      </div>

      {NOTIFICATION_FEATURES.preferences && showPrefs && (
        <div className="iv-card-padded space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Notification preferences</h2>
          {PREFERENCE_TOGGLES.filter((p) => p.supported).map((p) => (
            <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
              {p.label}
              <input type="checkbox" className="h-5 w-5 rounded" />
            </label>
          ))}
          {PREFERENCE_TOGGLES.every((p) => !p.supported) && (
            <p className="text-sm text-slate-500">Preferences are not available yet.</p>
          )}
        </div>
      )}

      {NOTIFICATION_FEATURES.pushNotifications && (
        <div className="iv-card-padded text-sm text-slate-600">Push notifications</div>
      )}

      {apiAvailable && NOTIFICATION_FEATURES.clientFilter && (
        <>
          {NOTIFICATION_FEATURES.clientSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications…"
                aria-label="Search notifications"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm min-h-[var(--iv-touch-min)] focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
              />
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Notification categories">
            {NOTIFICATION_CATEGORIES.filter((c) => c.supported).map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                onClick={() => setCategory(cat.id)}
                className={`iv-chip min-h-[var(--iv-touch-min)] shrink-0 whitespace-nowrap ${category === cat.id ? "iv-chip-active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2" role="group" aria-label="Read status filter">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`iv-chip min-h-[var(--iv-touch-min)] capitalize ${filter === f ? "iv-chip-active" : ""}`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </>
      )}

      {loading && <NotificationListSkeleton />}

      {error && (
        <CustomerErrorState
          title="Couldn't load notifications"
          message={error}
          onRetry={() => void refetch()}
          showContinueShopping={false}
        />
      )}

      {showUnavailable && <NotificationUnavailableState />}

      {showSearchEmpty && (
        <NotificationSearchEmptyState onClear={() => setSearch("")} />
      )}

      {showEmpty && !showSearchEmpty && search.trim().length === 0 && <NotificationEmptyState />}

      {!loading && !error && apiAvailable && visible.length > 0 && (
        <div className="space-y-3" role="list" aria-label="Notifications">
          {visible.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={NOTIFICATION_FEATURES.markRead ? (id) => void markAsRead(id) : undefined}
              onDelete={
                NOTIFICATION_FEATURES.deleteNotification
                  ? (id) => void deleteNotification(id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-slate-500" aria-hidden>
          Loading more…
        </div>
      )}
    </div>
  );
}

export const NotificationCenter = memo(NotificationCenterInner);
