import { Suspense } from "react";
import { SearchResultsPage } from "@/app/pages/SearchResultsPage";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
          <ProductCardSkeleton layout="grid" count={8} />
        </div>
      }
    >
      <SearchResultsPage />
    </Suspense>
  );
}
