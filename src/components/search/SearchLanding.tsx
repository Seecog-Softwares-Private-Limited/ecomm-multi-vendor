"use client";

import Link from "next/link";
import { Clock, Search, X } from "lucide-react";
import type { CategoryItem, ProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import type { ListingCommerce } from "@/hooks/useListingCommerce";

type SearchLandingProps = {
  recentSearches: string[];
  categories: CategoryItem[];
  suggestedProducts: ProductListItem[];
  loadingSuggestions: boolean;
  onSelectSearch: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  commerce?: ListingCommerce;
};

export function SearchLanding({
  recentSearches,
  categories,
  suggestedProducts,
  loadingSuggestions,
  onSelectSearch,
  onRemoveRecent,
  onClearRecent,
  commerce,
}: SearchLandingProps) {
  return (
    <div className="space-y-6 p-4 sm:p-5">
      {recentSearches.length > 0 && (
        <section aria-label="Recent searches">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Searches</h3>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-xs font-semibold text-[#FF6A00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
            >
              Clear All
            </button>
          </div>
          <ul className="space-y-1">
            {recentSearches.map((term) => (
              <li key={term} className="flex items-center gap-2 rounded-xl hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => onSelectSearch(term)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2.5 text-left text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6A00]/30"
                >
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <span className="truncate">{term}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRecent(term)}
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                  aria-label={`Remove ${term} from recent searches`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {categories.length > 0 && (
        <section aria-label="Popular categories">
          <h3 className="mb-2 text-sm font-bold text-slate-900">Popular Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#FF6A00]/40 hover:text-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
              >
                <span aria-hidden>{cat.icon ?? "📦"}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {(loadingSuggestions || suggestedProducts.length > 0) && (
        <section aria-label="Suggested products">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Suggested For You</h3>
          {loadingSuggestions ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 w-[160px] shrink-0 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : (
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestedProducts.slice(0, 6).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout="carousel"
                  animationDelayMs={Math.min(index * 40, 200)}
                  showWishlist={Boolean(commerce)}
                  isWishlisted={commerce?.isWishlisted(product.id) ?? false}
                  wishlistLoading={commerce?.wishlistTogglingId === product.id}
                  onWishlistToggle={
                    commerce ? () => void commerce.toggleWishlist(product) : undefined
                  }
                  cartQuantity={commerce?.getCartQuantity(product.id) ?? 0}
                  cartLoading={commerce?.cartActionProductId === product.id}
                  onAddToCart={commerce ? () => void commerce.addToCart(product) : undefined}
                  onIncrementCart={commerce ? () => commerce.incrementCart(product) : undefined}
                  onDecrementCart={commerce ? () => commerce.decrementCart(product) : undefined}
                  onGoToCart={commerce ? () => commerce.openCartDrawer() : undefined}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {recentSearches.length === 0 && categories.length === 0 && !loadingSuggestions && suggestedProducts.length === 0 && (
        <div className="py-8 text-center text-sm text-slate-500">
          <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden />
          Start typing to search products, categories, and brands
        </div>
      )}
    </div>
  );
}
