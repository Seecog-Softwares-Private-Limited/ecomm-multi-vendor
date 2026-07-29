import { Skeleton } from "@/app/components/ui/skeleton";

export function ProfileDashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
