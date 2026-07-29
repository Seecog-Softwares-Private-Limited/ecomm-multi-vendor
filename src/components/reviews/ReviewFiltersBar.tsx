"use client";

import { memo } from "react";
import { REVIEW_FEATURES } from "@/lib/reviews/review-features";
import { countReviewsWithPhotos, type ReviewFilters } from "@/lib/reviews/review-utils";
import type { ProductReview } from "@/lib/reviews/review-utils";

type ReviewFiltersBarProps = {
  filters: ReviewFilters;
  reviews: ProductReview[];
  onChange: (filters: ReviewFilters) => void;
};

function toggleStar(stars: Set<number>, star: number): Set<number> {
  const next = new Set(stars);
  if (next.has(star)) next.delete(star);
  else next.add(star);
  return next;
}

function ReviewFiltersBarInner({ filters, reviews, onChange }: ReviewFiltersBarProps) {
  const photoCount = countReviewsWithPhotos(reviews);
  const showPhotosFilter = REVIEW_FEATURES.reviewPhotos && photoCount > 0;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter reviews"
    >
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const active = filters.stars.has(star);
        return (
          <button
            key={star}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange({ ...filters, stars: toggleStar(filters.stars, star) })
            }
            className={`iv-chip min-h-[var(--iv-touch-min)] ${active ? "iv-chip-active" : ""}`}
          >
            {star}★
          </button>
        );
      })}

      {REVIEW_FEATURES.verifiedBadge && (
        <button
          type="button"
          aria-pressed={filters.verifiedOnly}
          onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
          className={`iv-chip min-h-[var(--iv-touch-min)] ${filters.verifiedOnly ? "iv-chip-active" : ""}`}
        >
          Verified Purchase
        </button>
      )}

      {showPhotosFilter && (
        <button
          type="button"
          aria-pressed={filters.withPhotosOnly}
          onClick={() =>
            onChange({ ...filters, withPhotosOnly: !filters.withPhotosOnly })
          }
          className={`iv-chip min-h-[var(--iv-touch-min)] ${filters.withPhotosOnly ? "iv-chip-active" : ""}`}
        >
          With Photos ({photoCount})
        </button>
      )}

      {(filters.stars.size > 0 || filters.verifiedOnly || filters.withPhotosOnly) && (
        <button
          type="button"
          onClick={() =>
            onChange({
              stars: new Set(),
              verifiedOnly: false,
              withPhotosOnly: false,
            })
          }
          className="text-sm font-semibold text-[var(--iv-brand)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)] rounded px-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export const ReviewFiltersBar = memo(ReviewFiltersBarInner);
