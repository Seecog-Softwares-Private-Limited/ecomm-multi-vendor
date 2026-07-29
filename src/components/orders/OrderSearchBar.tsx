"use client";

import { memo } from "react";
import { Search, X } from "lucide-react";

type OrderSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
};

export const OrderSearchBar = memo(function OrderSearchBar({
  value,
  onChange,
  resultCount,
}: OrderSearchBarProps) {
  return (
    <div className="relative">
      <label htmlFor="orders-search" className="sr-only">
        Search orders by product name or order ID
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="orders-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by product name or order ID"
        autoComplete="off"
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {typeof resultCount === "number" && value.trim().length > 0 && (
        <p className="mt-2 text-xs text-slate-500" aria-live="polite">
          {resultCount} result{resultCount !== 1 ? "s" : ""} found
        </p>
      )}
    </div>
  );
});
