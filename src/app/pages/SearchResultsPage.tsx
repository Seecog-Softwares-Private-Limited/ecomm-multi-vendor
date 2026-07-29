"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";
import { MENU_TYPE_SLUGS, type MenuTypeSlug } from "@/lib/catalog-constants";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { useListingCommerce } from "@/hooks/useListingCommerce";
import type { ProductListItem } from "@/types/catalog";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFiltersPanel } from "@/components/search/SearchFiltersPanel";
import {
  SearchFilterChips,
  DEFAULT_SEARCH_FILTERS,
} from "@/components/search/SearchFilterChips";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import { addRecentSearch } from "@/lib/search/search-history";
import {
  applySearchFilters,
  applySearchSort,
  countActiveFilters,
  deriveBrandsFromProducts,
  getPersistedSort,
  mapProductRows,
  persistSort,
  SEARCH_SORT_OPTIONS,
  type SearchFilters,
  type SearchSort,
} from "@/lib/search/search-utils";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer";

const PAGE_SIZE = 24;

function parseMenuType(raw: string | null): MenuTypeSlug | null {
  if (!raw) return null;
  return (MENU_TYPE_SLUGS as readonly string[]).includes(raw) ? (raw as MenuTypeSlug) : null;
}

function scopeLabel(
  menuType: MenuTypeSlug | null,
  categorySlug: string | null
): string | null {
  if (menuType === "deals") return "Deals";
  if (menuType === "new-arrivals") return "New Arrivals";
  if (menuType === "best-sellers") return "Best Sellers";
  if (categorySlug) {
    return categorySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return null;
}

const ProductGrid = memo(function ProductGrid({
  products,
  commerce,
}: {
  products: ProductListItem[];
  commerce: ReturnType<typeof useListingCommerce>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          layout="grid"
          animationDelayMs={Math.min(index * 40, 320)}
          showWishlist
          isWishlisted={commerce.isWishlisted(product.id)}
          wishlistLoading={commerce.wishlistTogglingId === product.id}
          onWishlistToggle={() => void commerce.toggleWishlist(product)}
          cartQuantity={commerce.getCartQuantity(product.id)}
          cartLoading={commerce.cartActionProductId === product.id}
          onAddToCart={() => void commerce.addToCart(product)}
          onIncrementCart={() => commerce.incrementCart(product)}
          onDecrementCart={() => commerce.decrementCart(product)}
          onGoToCart={() => commerce.openCartDrawer()}
        />
      ))}
    </div>
  );
});

export function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const categorySlugFromUrl = searchParams.get("categorySlug")?.trim() || null;
  const menuTypeFromUrl = parseMenuType(searchParams.get("menuType"));

  const [query, setQuery] = useState(qFromUrl);
  const [rawProducts, setRawProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [expandedPastPinFilter, setExpandedPastPinFilter] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [sort, setSort] = useState<SearchSort>("relevance");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductListItem[]>([]);
  const [apiBrands, setApiBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const commerce = useListingCommerce();
  const { location } = useDeliveryLocation();

  const searchTerm = qFromUrl.trim();
  const scopeHint = scopeLabel(menuTypeFromUrl, categorySlugFromUrl);

  useEffect(() => {
    setSort(getPersistedSort());
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) setCategories(j.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(qFromUrl);
  }, [qFromUrl]);

  const buildParams = useCallback(
    (includePincode: boolean, nextOffset: number) => {
      const params = new URLSearchParams({
        q: searchTerm,
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
      });
      if (categorySlugFromUrl) params.set("categorySlug", categorySlugFromUrl);
      if (menuTypeFromUrl) params.set("menuType", menuTypeFromUrl);
      const pin = (location.pincode ?? "").replace(/\D/g, "").slice(0, 6);
      if (includePincode && /^\d{6}$/.test(pin)) params.set("pincode", pin);
      return params;
    },
    [searchTerm, categorySlugFromUrl, menuTypeFromUrl, location.pincode]
  );

  const fetchPage = useCallback(
    async (nextOffset: number, append: boolean) => {
      if (!searchTerm) {
        setRawProducts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(false);
        setExpandedPastPinFilter(false);
      }

      const pin = (location.pincode ?? "").replace(/\D/g, "").slice(0, 6);
      const hasPin = /^\d{6}$/.test(pin);

      try {
        let res = await fetch(`/api/products?${buildParams(true, nextOffset).toString()}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed");
        let data = await res.json();
        let rows = mapProductRows(data);

        if (rows.length === 0 && hasPin && nextOffset === 0) {
          const res2 = await fetch(`/api/products?${buildParams(false, nextOffset).toString()}`, {
            credentials: "include",
          });
          if (res2.ok) {
            data = await res2.json();
            const retryRows = mapProductRows(data);
            if (retryRows.length > 0) {
              rows = retryRows;
              setExpandedPastPinFilter(true);
            }
          }
        }

        setRawProducts((prev) => (append ? [...prev, ...rows] : rows));
        setHasMore(rows.length >= PAGE_SIZE);
        setOffset(nextOffset + rows.length);
      } catch {
        setError(true);
        if (!append) setRawProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, buildParams, location.pincode]
  );

  useEffect(() => {
    setOffset(0);
    void fetchPage(0, false);
  }, [fetchPage]);

  useEffect(() => {
    if (!categorySlugFromUrl) {
      setApiBrands([]);
      return;
    }
    const params = new URLSearchParams({ categorySlug: categorySlugFromUrl });
    const pin = (location.pincode ?? "").replace(/\D/g, "").slice(0, 6);
    if (/^\d{6}$/.test(pin)) params.set("pincode", pin);
    fetch(`/api/products/brands?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) setApiBrands(j.data as string[]);
      })
      .catch(() => setApiBrands([]));
  }, [categorySlugFromUrl, location.pincode]);

  useEffect(() => {
    if (searchTerm && !loading && rawProducts.length === 0 && !error) {
      fetch("/api/products?menuType=best-sellers&limit=8", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json) setRelatedProducts(mapProductRows(json));
        })
        .catch(() => setRelatedProducts([]));
    } else {
      setRelatedProducts([]);
    }
  }, [searchTerm, loading, rawProducts.length, error]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || loading || loadingMore || !searchTerm) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchPage(offset, true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, searchTerm, offset, fetchPage]);

  const brands = useMemo(() => {
    if (apiBrands.length > 0) return apiBrands;
    return deriveBrandsFromProducts(rawProducts);
  }, [apiBrands, rawProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = applySearchFilters(rawProducts, filters);
    return applySearchSort(filtered, sort);
  }, [rawProducts, filters, sort]);

  const activeFilterCount = countActiveFilters(filters) + (categorySlugFromUrl ? 1 : 0);

  const navigateSearch = useCallback(
    (term: string) => {
      addRecentSearch(term);
      const params = new URLSearchParams({ q: term });
      if (categorySlugFromUrl) params.set("categorySlug", categorySlugFromUrl);
      if (menuTypeFromUrl) params.set("menuType", menuTypeFromUrl);
      router.push(`/search?${params.toString()}`);
    },
    [router, categorySlugFromUrl, menuTypeFromUrl]
  );

  const clearFilters = () => setFilters(DEFAULT_SEARCH_FILTERS);

  const clearAllFiltersAndScope = () => {
    clearFilters();
    if (categorySlugFromUrl || menuTypeFromUrl) {
      const params = new URLSearchParams({ q: searchTerm });
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleCategoryFilter = (slug: string | null) => {
    const params = new URLSearchParams({ q: searchTerm });
    if (slug) params.set("categorySlug", slug);
    if (menuTypeFromUrl) params.set("menuType", menuTypeFromUrl);
    router.push(`/search?${params.toString()}`);
  };

  const handleSortChange = (next: SearchSort) => {
    setSort(next);
    persistSort(next);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={navigateSearch}
            autoFocus={!searchTerm}
            commerce={commerce}
            categorySlug={categorySlugFromUrl}
            menuType={menuTypeFromUrl ?? undefined}
            pincode={location.pincode ?? ""}
          />
        </div>

        {!searchTerm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 sm:p-10">
            <p className="text-sm sm:text-base">
              Focus the search box above to see recent searches, categories, and suggestions.
            </p>
          </div>
        )}

        {searchTerm && (
          <>
            <div className="mb-4">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Results for <span className="text-[#FF6A00]">&quot;{searchTerm}&quot;</span>
              </h1>
              {scopeHint && (
                <p className="mt-1 text-sm font-medium capitalize text-slate-600">in {scopeHint}</p>
              )}
              {expandedPastPinFilter && (
                <p className="mt-2 max-w-2xl text-sm text-amber-900/90">
                  Your saved PIN isn&apos;t in the platform delivery list, so results were widened to
                  the full catalog.
                </p>
              )}
            </div>

            <SearchFilterChips
              filters={filters}
              categoryLabel={scopeHint}
              onRemoveCategory={
                categorySlugFromUrl
                  ? () => {
                      const params = new URLSearchParams({ q: searchTerm });
                      if (menuTypeFromUrl) params.set("menuType", menuTypeFromUrl);
                      router.push(`/search?${params.toString()}`);
                    }
                  : undefined
              }
              onChange={setFilters}
              onClearAll={clearAllFiltersAndScope}
            />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">
                {loading
                  ? "Searching…"
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? "result" : "results"}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="search-sort" className="sr-only">
                  Sort results
                </label>
                <select
                  id="search-sort"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as SearchSort)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                >
                  {SEARCH_SORT_OPTIONS.filter((o) => o.supported).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-6 lg:gap-8">
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <SearchFiltersPanel
                    filters={filters}
                    brands={brands}
                    categories={categories}
                    selectedCategorySlug={categorySlugFromUrl}
                    onCategoryChange={handleCategoryFilter}
                    onChange={setFilters}
                    onClear={clearFilters}
                    idPrefix="desktop"
                  />
                </div>
              </aside>

              <div className="min-w-0 flex-1">
                {loading && <ProductCardSkeleton layout="grid" count={8} />}

                {error && (
                  <CustomerErrorState
                    title="Couldn't load results"
                    message="Failed to load search results. Check your connection and try again."
                    onRetry={() => void fetchPage(0, false)}
                  />
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                  <SearchEmptyState
                    query={searchTerm}
                    relatedProducts={relatedProducts}
                    commerce={commerce}
                    hasActiveFilters={activeFilterCount > 0}
                    onClearFilters={clearAllFiltersAndScope}
                  />
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                  <>
                    <ProductGrid products={filteredProducts} commerce={commerce} />
                    {hasMore && (
                      <div ref={loadMoreRef} className="py-8">
                        {loadingMore && <ProductCardSkeleton layout="grid" count={4} />}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-4">
            <SearchFiltersPanel
              filters={filters}
              brands={brands}
              categories={categories}
              selectedCategorySlug={categorySlugFromUrl}
              onCategoryChange={handleCategoryFilter}
              onChange={setFilters}
              onClear={clearFilters}
              idPrefix="mobile"
            />
          </div>
          <DrawerFooter>
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="w-full rounded-xl bg-[#FF6A00] py-3 text-sm font-semibold text-white hover:bg-[#E55F00]"
            >
              Show {filteredProducts.length} results
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
