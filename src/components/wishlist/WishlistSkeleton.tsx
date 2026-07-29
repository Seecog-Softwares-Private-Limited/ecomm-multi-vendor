import { Skeleton } from "@/app/components/ui/skeleton";

export function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white"
        >
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
