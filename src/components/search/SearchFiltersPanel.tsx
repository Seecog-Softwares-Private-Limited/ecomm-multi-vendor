"use client";

import { Filter } from "lucide-react";
import type { CategoryItem } from "@/types/catalog";
import {
  DISCOUNT_FILTER_OPTIONS,
  RATING_FILTER_OPTIONS,
  type SearchFilters,
} from "@/lib/search/search-utils";

type SearchFiltersPanelProps = {
  filters: SearchFilters;
  brands: string[];
  brandsLoading?: boolean;
  categories?: CategoryItem[];
  selectedCategorySlug?: string | null;
  onCategoryChange?: (slug: string | null) => void;
  onChange: (next: SearchFilters) => void;
  onClear: () => void;
  idPrefix?: string;
};

export function SearchFiltersPanel({
  filters,
  brands,
  brandsLoading = false,
  categories = [],
  selectedCategorySlug,
  onCategoryChange,
  onChange,
  onClear,
  idPrefix = "search-filter",
}: SearchFiltersPanelProps) {
  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-slate-900">
          <Filter className="h-4 w-4" aria-hidden />
          Filters
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-[#FF6A00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        >
          Clear All
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold text-slate-900">Price Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-500">
            Min (₹)
            <input
              type="number"
              min={0}
              value={filters.minPrice || ""}
              onChange={(e) =>
                onChange({ ...filters, minPrice: Math.max(0, Number(e.target.value) || 0) })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
            />
          </label>
          <label className="block text-xs text-slate-500">
            Max (₹)
            <input
              type="number"
              min={0}
              value={filters.maxPrice >= 500_000 ? "" : filters.maxPrice}
              placeholder="No max"
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : 500_000,
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
            />
          </label>
        </div>
      </div>

      {categories.length > 0 && onCategoryChange && (
        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">Category</h4>
          <select
            value={selectedCategorySlug ?? ""}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-sm font-bold text-slate-900">Rating</h4>
        <div className="space-y-2">
          {RATING_FILTER_OPTIONS.map((opt) => (
            <label key={opt.minRating} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={`${idPrefix}-rating`}
                checked={filters.minRating === opt.minRating}
                onChange={() =>
                  onChange({
                    ...filters,
                    minRating: filters.minRating === opt.minRating ? null : opt.minRating,
                  })
                }
                className="h-4 w-4 border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">Brand</h4>
          {brandsLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="h-4 w-4 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <span className="text-sm text-slate-700">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h4 className="mb-3 text-sm font-bold text-slate-900">Discount</h4>
        <div className="space-y-2">
          {DISCOUNT_FILTER_OPTIONS.map((opt) => (
            <label key={opt.minPercent} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={`${idPrefix}-discount`}
                checked={filters.minDiscount === opt.minPercent}
                onChange={() =>
                  onChange({
                    ...filters,
                    minDiscount: filters.minDiscount === opt.minPercent ? null : opt.minPercent,
                  })
                }
                className="h-4 w-4 border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
