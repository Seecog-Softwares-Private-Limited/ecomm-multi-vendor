"use client";

import { memo } from "react";
import { REVIEW_SORT_OPTIONS, type ReviewSort } from "@/lib/reviews/review-utils";

type ReviewSortSelectProps = {
  value: ReviewSort;
  onChange: (sort: ReviewSort) => void;
};

function ReviewSortSelectInner({ value, onChange }: ReviewSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="review-sort" className="shrink-0 text-sm font-medium text-slate-700">
        Sort by
      </label>
      <select
        id="review-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as ReviewSort)}
        className="min-h-[var(--iv-touch-min)] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
      >
        {REVIEW_SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const ReviewSortSelect = memo(ReviewSortSelectInner);
