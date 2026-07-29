import { Skeleton } from "@/app/components/ui/skeleton";

export function HomeBannerSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 lg:px-6">
      <Skeleton className="aspect-[2.2/1] w-full rounded-2xl sm:aspect-[2.8/1] lg:aspect-[3.2/1]" />
    </div>
  );
}

export function HomeCategoriesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 lg:px-6">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <div className="flex gap-4 overflow-hidden py-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-full sm:h-[72px] sm:w-[72px]" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePullRefreshIndicator({
  progress,
  refreshing,
  pullDistance,
}: {
  progress: number;
  refreshing: boolean;
  pullDistance: number;
}) {
  if (pullDistance <= 0 && !refreshing) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] flex justify-center"
      style={{
        transform: `translateY(${refreshing ? 56 : Math.min(pullDistance, 56)}px)`,
        transition: refreshing ? "transform 0.2s ease" : undefined,
      }}
      aria-live="polite"
      aria-busy={refreshing}
    >
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg backdrop-blur">
        <span
          className={`inline-block h-4 w-4 rounded-full border-2 border-[#FF6A00] border-t-transparent ${
            refreshing ? "animate-spin" : ""
          }`}
          style={
            refreshing
              ? undefined
              : { transform: `rotate(${progress * 360}deg)` }
          }
          aria-hidden
        />
        {refreshing ? "Refreshing…" : progress >= 1 ? "Release to refresh" : "Pull to refresh"}
      </div>
    </div>
  );
}
