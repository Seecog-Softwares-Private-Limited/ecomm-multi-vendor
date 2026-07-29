import { Skeleton } from "@/app/components/ui/skeleton";

type ProductCardSkeletonProps = {
  layout?: "grid" | "carousel";
  count?: number;
};

export function ProductCardSkeleton({ layout = "grid", count = 8 }: ProductCardSkeletonProps) {
  if (layout === "carousel") {
    return (
      <div className="flex gap-4 overflow-hidden py-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-[200px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:w-[220px]"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3 sm:p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
