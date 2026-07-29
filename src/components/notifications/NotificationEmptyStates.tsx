"use client";

import { memo } from "react";
import { Bell } from "lucide-react";

export const NotificationEmptyState = memo(function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-2xl">
        🔔
      </div>
      <h3 className="text-lg font-bold text-slate-900">You&apos;re all caught up!</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        New notifications will appear here.
      </p>
    </div>
  );
});

export const NotificationSearchEmptyState = memo(function NotificationSearchEmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Bell className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
      <h3 className="text-lg font-bold text-slate-900">No matching notifications</h3>
      <p className="mt-2 text-sm text-slate-600">Try different keywords.</p>
      <button type="button" onClick={onClear} className="iv-btn-outline mt-4">
        Clear search
      </button>
    </div>
  );
});

export const NotificationUnavailableState = memo(function NotificationUnavailableState() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Bell className="h-8 w-8 text-slate-400" aria-hidden />
      </div>
      <h3 className="text-lg font-bold text-slate-900">You&apos;re all caught up!</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Order updates, payment alerts, and account notifications will appear here when
        available on your account.
      </p>
    </div>
  );
});
