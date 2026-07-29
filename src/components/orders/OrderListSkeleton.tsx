import { Skeleton } from "@/app/components/ui/skeleton";

export function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm"
        >
          <div className="flex gap-4">
            <Skeleton className="h-[90px] w-[90px] shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-3/4 max-w-xs" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
