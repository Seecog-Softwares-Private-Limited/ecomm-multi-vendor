"use client";

import { X } from "lucide-react";
import {
  DEFAULT_SEARCH_FILTERS,
  formatPriceRange,
  type SearchFilters,
} from "@/lib/search/search-utils";

type Chip = { id: string; label: string; onRemove: () => void };

type SearchFilterChipsProps = {
  filters: SearchFilters;
  categoryLabel?: string | null;
  onRemoveCategory?: () => void;
  onChange: (next: SearchFilters) => void;
  onClearAll: () => void;
};

function buildChips(
  filters: SearchFilters,
  categoryLabel: string | null | undefined,
  onRemoveCategory: (() => void) | undefined,
  onChange: (next: SearchFilters) => void
): Chip[] {
  const chips: Chip[] = [];

  if (categoryLabel && onRemoveCategory) {
    chips.push({
      id: "category",
      label: categoryLabel,
      onRemove: onRemoveCategory,
    });
  }

  if (filters.minPrice > 0 || filters.maxPrice < 500_000) {
    const maxLabel = filters.maxPrice >= 500_000 ? 500_000 : filters.maxPrice;
    chips.push({
      id: "price",
      label:
        filters.maxPrice >= 500_000
          ? `${formatPriceRange(filters.minPrice, maxLabel).split("–")[0]?.trim() ?? ""}+`
          : formatPriceRange(filters.minPrice, maxLabel),
      onRemove: () => onChange({ ...filters, minPrice: 0, maxPrice: 500_000 }),
    });
  }

  if (filters.minRating != null) {
    chips.push({
      id: "rating",
      label: `${filters.minRating}★ & Above`,
      onRemove: () => onChange({ ...filters, minRating: null }),
    });
  }

  for (const brand of filters.brands) {
    chips.push({
      id: `brand:${brand}`,
      label: brand,
      onRemove: () =>
        onChange({ ...filters, brands: filters.brands.filter((b) => b !== brand) }),
    });
  }

  if (filters.minDiscount != null) {
    chips.push({
      id: "discount",
      label: `${filters.minDiscount}%+ OFF`,
      onRemove: () => onChange({ ...filters, minDiscount: null }),
    });
  }

  return chips;
}

export function SearchFilterChips({
  filters,
  categoryLabel,
  onRemoveCategory,
  onChange,
  onClearAll,
}: SearchFilterChipsProps) {
  const chips = buildChips(filters, categoryLabel, onRemoveCategory, onChange);
  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#FF6A00]/40 hover:text-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="h-3 w-3" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-[#FF6A00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
      >
        Clear All
      </button>
    </div>
  );
}

export { DEFAULT_SEARCH_FILTERS };
