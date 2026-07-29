"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Search } from "lucide-react";
import type { CategoryItem, ProductListItem } from "@/types/catalog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "@/lib/search/search-history";
import {
  deriveBrandsFromProducts,
  filterCategoriesForQuery,
  mapProductRows,
} from "@/lib/search/search-utils";
import { SearchLanding } from "@/components/search/SearchLanding";
import {
  SearchSuggestions,
  buildSuggestions,
  type SearchSuggestionItem,
} from "@/components/search/SearchSuggestions";
import type { ListingCommerce } from "@/hooks/useListingCommerce";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (term: string) => void;
  autoFocus?: boolean;
  commerce?: ListingCommerce;
  categorySlug?: string | null;
  menuType?: string | null;
  pincode?: string;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  commerce,
  categorySlug,
  menuType,
  pincode = "",
}: SearchBarProps) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<ProductListItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionProducts, setSuggestionProducts] = useState<ProductListItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const debouncedQuery = useDebouncedValue(value, 300);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        const d = j?.data;
        if (Array.isArray(d)) setCategories(d as CategoryItem[]);
      })
      .catch(() => {});

    setLoadingSuggestions(true);
    fetch("/api/products?menuType=best-sellers&limit=8", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) setSuggestedProducts(mapProductRows(json));
      })
      .finally(() => setLoadingSuggestions(false));

    const SR =
      typeof window !== "undefined"
        ? (window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
          (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
        : undefined;
    setVoiceSupported(Boolean(SR));
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setSuggestionProducts([]);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ q, limit: "8" });
    if (categorySlug) params.set("categorySlug", categorySlug);
    if (menuType) params.set("menuType", menuType);
    const pin = pincode.replace(/\D/g, "").slice(0, 6);
    if (/^\d{6}$/.test(pin)) params.set("pincode", pin);

    fetch(`/api/products?${params.toString()}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json) setSuggestionProducts(mapProductRows(json));
      })
      .catch(() => {
        if (!cancelled) setSuggestionProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, categorySlug, menuType, pincode]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const brands = deriveBrandsFromProducts(suggestionProducts);
  const filteredCategories = filterCategoriesForQuery(categories, debouncedQuery);
  const suggestionItems = buildSuggestions(
    debouncedQuery,
    suggestionProducts,
    filteredCategories,
    brands
  );

  const showLanding = open && !value.trim();
  const showSuggestions = open && value.trim().length > 0;

  const commitSearch = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      setRecentSearches(addRecentSearch(t));
      setOpen(false);
      onSubmit(t);
    },
    [onSubmit]
  );

  const handleSelectSuggestion = useCallback(
    (item: SearchSuggestionItem) => {
      if (item.type === "product") {
        setOpen(false);
        router.push(item.href);
        return;
      }
      if (item.type === "query") {
        commitSearch(item.label);
        return;
      }
      setOpen(false);
      router.push(item.href);
    },
    [commitSearch, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showSuggestions || suggestionItems.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        commitSearch(value);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestionItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestionItems[activeIndex]) {
        handleSelectSuggestion(suggestionItems[activeIndex]);
      } else {
        commitSearch(value);
      }
    }
  };

  const startVoice = () => {
    const W = window as Window & {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      if (text) {
        onChange(text);
        setOpen(true);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  return (
    <div ref={rootRef} className="relative max-w-3xl flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commitSearch(value);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        <input
          ref={inputRef}
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            onChange(e.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
              setRecentSearches(getRecentSearches());
            }
          }}
            onKeyDown={handleKeyDown}
            placeholder="Search for products, brands and more"
            className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-20 text-slate-900 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-label="Search products"
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={startVoice}
              className={`absolute right-12 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 ${
                listening ? "bg-red-100 text-red-600" : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label={listening ? "Listening…" : "Voice search"}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
        </div>
        <button
          type="submit"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FF6A00] px-5 py-3 font-semibold text-white transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        >
          <Search className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {open && (showLanding || showSuggestions) && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          role="dialog"
          aria-label="Search suggestions"
        >
          {showLanding && (
            <SearchLanding
              recentSearches={recentSearches}
              categories={categories}
              suggestedProducts={suggestedProducts}
              loadingSuggestions={loadingSuggestions}
              commerce={commerce}
              onSelectSearch={commitSearch}
              onRemoveRecent={(term) => setRecentSearches(removeRecentSearch(term))}
              onClearRecent={() => {
                clearRecentSearches();
                setRecentSearches([]);
              }}
            />
          )}
          {showSuggestions && (
            <SearchSuggestions
              query={value}
              items={suggestionItems}
              activeIndex={activeIndex}
              onSelect={handleSelectSuggestion}
              listId={listId}
            />
          )}
        </div>
      )}
    </div>
  );
}
