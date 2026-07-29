"use client";

import { FolderOpen, Package, Tag } from "lucide-react";
import type { CategoryItem, ProductListItem } from "@/types/catalog";
import { HighlightText } from "@/components/search/HighlightText";

export type SearchSuggestionItem =
  | { type: "product"; id: string; label: string; href: string }
  | { type: "category"; id: string; label: string; href: string }
  | { type: "brand"; id: string; label: string; href: string }
  | { type: "query"; id: string; label: string; href: string };

type SearchSuggestionsProps = {
  query: string;
  items: SearchSuggestionItem[];
  activeIndex: number;
  onSelect: (item: SearchSuggestionItem) => void;
  listId: string;
};

export function buildSuggestions(
  query: string,
  products: ProductListItem[],
  categories: CategoryItem[],
  brands: string[]
): SearchSuggestionItem[] {
  const q = query.trim();
  if (!q) return [];

  const items: SearchSuggestionItem[] = [];

  items.push({
    type: "query",
    id: `q:${q}`,
    label: q,
    href: `/search?q=${encodeURIComponent(q)}`,
  });

  for (const cat of categories.slice(0, 4)) {
    items.push({
      type: "category",
      id: `cat:${cat.id}`,
      label: cat.name,
      href: `/search?q=${encodeURIComponent(q)}&categorySlug=${encodeURIComponent(cat.slug)}`,
    });
  }

  for (const brand of brands.slice(0, 4)) {
    items.push({
      type: "brand",
      id: `brand:${brand}`,
      label: brand,
      href: `/search?q=${encodeURIComponent(`${brand} ${q}`)}`,
    });
  }

  for (const p of products.slice(0, 6)) {
    items.push({
      type: "product",
      id: p.id,
      label: p.name,
      href: `/product/${p.slug ?? p.id}`,
    });
  }

  return items;
}

function iconFor(type: SearchSuggestionItem["type"]) {
  if (type === "category") return FolderOpen;
  if (type === "brand") return Tag;
  return Package;
}

export function SearchSuggestions({
  query,
  items,
  activeIndex,
  onSelect,
  listId,
}: SearchSuggestionsProps) {
  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500" role="status">
        No suggestions for &quot;{query}&quot;
      </div>
    );
  }

  return (
    <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-[min(70vh,420px)] overflow-y-auto py-1">
      {items.map((item, index) => {
        const Icon = iconFor(item.type);
        const isActive = index === activeIndex;
        return (
          <li key={item.id} role="option" aria-selected={isActive}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                isActive ? "bg-orange-50 text-[#FF6A00]" : "text-slate-800 hover:bg-slate-50"
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6A00]/30`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {item.type === "query" ? (
                  <>
                    Search for &quot;<HighlightText text={item.label} query={query} />&quot;
                  </>
                ) : (
                  <HighlightText text={item.label} query={query} />
                )}
              </span>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {item.type}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
