"use client";

import { memo } from "react";

export const TicketListSkeleton = memo(function TicketListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading tickets">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="iv-card p-5">
          <div className="mb-3 flex gap-2">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
          </div>
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
});

export const TicketDetailSkeleton = memo(function TicketDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading ticket">
      <div className="h-6 w-32 rounded bg-slate-200" />
      <div className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="iv-card h-24 rounded-2xl bg-slate-100" />
      <div className="iv-card h-32 rounded-2xl bg-slate-100" />
    </div>
  );
});

export const HelpCenterSkeleton = memo(function HelpCenterSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-8" aria-busy="true">
      <div className="h-40 rounded-2xl bg-slate-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
});
