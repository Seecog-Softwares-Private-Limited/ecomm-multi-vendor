"use client";

import { memo } from "react";
import {
  ORDER_FILTERS,
  type OrderFilter,
} from "@/lib/orders/order-list-utils";

type OrderFilterChipsProps = {
  activeFilter: OrderFilter;
  counts: Record<OrderFilter, number>;
  onChange: (filter: OrderFilter) => void;
};

export const OrderFilterChips = memo(function OrderFilterChips({
  activeFilter,
  counts,
  onChange,
}: OrderFilterChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter orders by status"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin"
    >
      {ORDER_FILTERS.map((filter) => {
        const selected = activeFilter === filter.id;
        const count = counts[filter.id];
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 ${
              selected
                ? "border-[#FF6A00] bg-[#FF6A00] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
              aria-label={`${count} orders`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
});
