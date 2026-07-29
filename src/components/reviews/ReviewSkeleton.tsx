"use client";

import { memo } from "react";

function ReviewCardSkeletonInner() {
  return (
    <div className="animate-pulse border-b border-slate-100 py-5 sm:py-6" aria-hidden>
      <div className="flex gap-3 sm:gap-4">
        <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-3.5 w-24 rounded bg-slate-100" />
            <div className="h-3.5 w-20 rounded bg-slate-100" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-[92%] rounded bg-slate-100" />
            <div className="h-3 w-[80%] rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const ReviewCardSkeleton = memo(ReviewCardSkeletonInner);

export function ReviewSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="iv-card p-4 sm:p-6" aria-busy="true" aria-label="Loading reviews">
      <div className="animate-pulse space-y-6">
        <div className="h-7 w-40 rounded bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
          <div className="space-y-3">
            <div className="mx-auto h-12 w-16 rounded bg-slate-200 sm:mx-0" />
            <div className="mx-auto h-4 w-24 rounded bg-slate-100 sm:mx-0" />
            <div className="mx-auto h-3 w-32 rounded bg-slate-100 sm:mx-0" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-6 rounded bg-slate-100" />
                <div className="h-2.5 flex-1 rounded-full bg-slate-100" />
                <div className="h-3 w-8 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-16 rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="border-t border-slate-100 pt-2">
          {Array.from({ length: count }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
