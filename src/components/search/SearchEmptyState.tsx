"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import type { ProductListItem } from "@/types/catalog";
import { ProductRowSection } from "@/components/ProductRowSection";
import type { ListingCommerce } from "@/hooks/useListingCommerce";

type SearchEmptyStateProps = {
  query: string;
  relatedProducts?: ProductListItem[];
  commerce?: ListingCommerce;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
};

export function SearchEmptyState({
  query,
  relatedProducts = [],
  commerce,
  onClearFilters,
  hasActiveFilters,
}: SearchEmptyStateProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
        <SearchX className="mx-auto mb-4 h-16 w-16 text-slate-300" aria-hidden />
        <h2 className="mb-2 text-xl font-bold text-slate-900">No products found</h2>
        <p className="mb-4 text-slate-600">
          We couldn&apos;t find matches for &quot;{query}&quot;.
        </p>
        <ul className="mb-6 inline-block text-left text-sm text-slate-600">
          <li>Try different keywords</li>
          <li>Use fewer filters</li>
          <li>Browse categories below</li>
        </ul>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
            >
              Clear filters
            </button>
          )}
          <Link
            href="/"
            className="rounded-xl bg-[#FF6A00] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
          >
            Continue Shopping
          </Link>
          <Link
            href="/browse-categories"
            className="rounded-xl border border-[#FF6A00] px-5 py-2.5 text-sm font-semibold text-[#FF6A00] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
          >
            Browse categories
          </Link>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <ProductRowSection
          title="You might also like"
          subtitle="Popular picks while you refine your search"
          products={relatedProducts}
          ctaHref="/category/best-sellers"
          ctaLabel="View bestsellers"
          commerce={commerce}
          bgColor="#FAFAFA"
        />
      )}
    </div>
  );
}
