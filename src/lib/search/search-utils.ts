import type { ProductListItem } from "@/types/catalog";
import type { CategoryItem } from "@/types/catalog";

export type SearchSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "discount";

export type SearchFilters = {
  minPrice: number;
  maxPrice: number;
  minRating: number | null;
  brands: string[];
  minDiscount: number | null;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  minPrice: 0,
  maxPrice: 500_000,
  minRating: null,
  brands: [],
  minDiscount: null,
};

export const SEARCH_SORT_OPTIONS: { value: SearchSort; label: string; supported: boolean }[] = [
  { value: "relevance", label: "Relevance", supported: true },
  { value: "price-asc", label: "Price: Low → High", supported: true },
  { value: "price-desc", label: "Price: High → Low", supported: true },
  { value: "rating", label: "Rating", supported: true },
  { value: "discount", label: "Discount", supported: true },
];

export const DISCOUNT_FILTER_OPTIONS = [
  { label: "10% and above", minPercent: 10 },
  { label: "25% and above", minPercent: 25 },
  { label: "50% and above", minPercent: 50 },
];

export const RATING_FILTER_OPTIONS = [
  { label: "4★ & above", minRating: 4 },
  { label: "3★ & above", minRating: 3 },
  { label: "2★ & above", minRating: 2 },
];

const SORT_STORAGE_KEY = "indovyapar-search-sort";

export function getPersistedSort(): SearchSort {
  if (typeof window === "undefined") return "relevance";
  try {
    const raw = sessionStorage.getItem(SORT_STORAGE_KEY);
    if (raw && SEARCH_SORT_OPTIONS.some((o) => o.value === raw && o.supported)) {
      return raw as SearchSort;
    }
  } catch {
    // ignore
  }
  return "relevance";
}

export function persistSort(sort: SearchSort): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SORT_STORAGE_KEY, sort);
  } catch {
    // ignore
  }
}

export function getDiscountPercent(price: number, oldPrice?: number | null): number {
  if (oldPrice == null || oldPrice <= price || oldPrice <= 0) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function mapProductRows(data: unknown): ProductListItem[] {
  const list = Array.isArray((data as { data?: unknown })?.data)
    ? (data as { data: Record<string, unknown>[] }).data
    : [];
  return list.map((p) => ({
    id: String(p.id),
    slug: typeof p.slug === "string" ? p.slug : String(p.id),
    name: String(p.name),
    price: Number(p.price),
    oldPrice: typeof p.oldPrice === "number" ? p.oldPrice : undefined,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews: typeof p.reviews === "number" ? p.reviews : 0,
    imageUrl: (p.imageUrl as string | null | undefined) ?? undefined,
  }));
}

/** Derive brand-like tokens from product names when no brands API scope exists. */
export function deriveBrandsFromProducts(products: ProductListItem[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    const first = p.name.trim().split(/\s+/)[0];
    if (first && first.length > 1) set.add(first);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 30);
}

export function applySearchFilters(products: ProductListItem[], filters: SearchFilters): ProductListItem[] {
  return products.filter((p) => {
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (filters.minRating != null && p.rating < filters.minRating) return false;
    if (filters.brands.length > 0) {
      const match = filters.brands.some((b) => p.name.toLowerCase().includes(b.toLowerCase()));
      if (!match) return false;
    }
    if (filters.minDiscount != null) {
      const pct = getDiscountPercent(p.price, p.oldPrice);
      if (pct < filters.minDiscount) return false;
    }
    return true;
  });
}

export function applySearchSort(products: ProductListItem[], sort: SearchSort): ProductListItem[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "discount":
      return list.sort(
        (a, b) =>
          getDiscountPercent(b.price, b.oldPrice) - getDiscountPercent(a.price, a.oldPrice)
      );
    default:
      return list;
  }
}

export function countActiveFilters(filters: SearchFilters): number {
  let n = 0;
  if (filters.minPrice > 0) n += 1;
  if (filters.maxPrice < 500_000) n += 1;
  if (filters.minRating != null) n += 1;
  if (filters.brands.length > 0) n += 1;
  if (filters.minDiscount != null) n += 1;
  return n;
}

export function filterCategoriesForQuery(categories: CategoryItem[], query: string): CategoryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories.slice(0, 6);
  return categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
}

export function highlightParts(text: string, query: string): { before: string; match: string; after: string } | null {
  const q = query.trim();
  if (!q) return null;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx < 0) return null;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + q.length),
    after: text.slice(idx + q.length),
  };
}

export function formatPriceRange(min: number, max: number): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}
