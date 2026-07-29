"use client";

import { memo } from "react";

export const NotificationListSkeleton = memo(function NotificationListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading notifications">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="iv-card flex gap-3 p-4 sm:p-5">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
});
