"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProductReviews } from "@/hooks/useProductReviews";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewEmptyState } from "@/components/reviews/ReviewEmptyState";
import { ReviewFiltersBar } from "@/components/reviews/ReviewFiltersBar";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewSortSelect } from "@/components/reviews/ReviewSortSelect";
import { ReviewSectionSkeleton } from "@/components/reviews/ReviewSkeleton";
import { WriteReviewDialog } from "@/components/reviews/WriteReviewDialog";
import { REVIEW_FEATURES } from "@/lib/reviews/review-features";
import {
  computeRatingDistribution,
  DEFAULT_REVIEW_FILTERS,
  filterReviews,
  hasActiveReviewFilters,
  sortReviews,
  type ReviewFilters,
  type ReviewSort,
} from "@/lib/reviews/review-utils";

type ProductReviewsSectionProps = {
  productId: string;
  productName: string;
  avgRating: number;
  reviewCount: number;
};

function ProductReviewsSectionInner({
  productId,
  productName,
  avgRating,
  reviewCount,
}: ProductReviewsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { reviews, loading, error, refetch } = useProductReviews(productId);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [filters, setFilters] = useState<ReviewFilters>(DEFAULT_REVIEW_FILTERS);
  const [writeOpen, setWriteOpen] = useState(false);

  const distribution = useMemo(() => computeRatingDistribution(reviews), [reviews]);

  const processedReviews = useMemo(() => {
    const filtered = filterReviews(reviews, filters);
    return sortReviews(filtered, sort);
  }, [reviews, filters, sort]);

  useEffect(() => {
    if (loading || typeof window === "undefined") return;
    if (window.location.hash === "#reviews" || window.location.hash === "#write-review") {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.location.hash === "#write-review" && REVIEW_FEATURES.writeReview) {
        setWriteOpen(true);
      }
    }
  }, [loading]);

  if (!REVIEW_FEATURES.listReviews) {
    return null;
  }

  const displayAvg =
    avgRating > 0
      ? avgRating
      : reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
  const displayCount = reviewCount > 0 ? reviewCount : reviews.length;

  const showEmpty = !loading && !error && displayCount === 0 && reviews.length === 0;
  const showFilteredEmpty =
    !loading && !error && reviews.length > 0 && processedReviews.length === 0;
  const showSummary = displayCount > 0 || reviews.length > 0;

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="mx-auto w-full max-w-[1360px] scroll-mt-24 px-3 py-6 sm:px-4 lg:px-10"
      aria-labelledby="reviews-heading"
    >
      <div className="iv-card iv-fade-in overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="reviews-heading" className="iv-section-title text-xl sm:text-2xl">
            Customer Reviews
          </h2>
          {REVIEW_FEATURES.writeReview && (
            <button
              type="button"
              onClick={() => setWriteOpen(true)}
              className="iv-btn-primary"
            >
              Write a Review
            </button>
          )}
        </div>

        {loading && <ReviewSectionSkeleton />}

        {error && (
          <CustomerErrorState
            title="Couldn't load reviews"
            message="Failed to load customer reviews. Please try again."
            onRetry={() => void refetch()}
            showContinueShopping={false}
          />
        )}

        {!loading && !error && showEmpty && <ReviewEmptyState />}

        {!loading && !error && !showEmpty && (
          <>
            {showSummary && (
              <RatingSummary
                avgRating={displayAvg}
                reviewCount={displayCount}
                distribution={distribution}
                sampleSize={reviews.length < displayCount ? reviews.length : undefined}
              />
            )}

            {reviews.length > 0 && REVIEW_FEATURES.clientSortFilter && (
              <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <ReviewFiltersBar filters={filters} reviews={reviews} onChange={setFilters} />
                <ReviewSortSelect value={sort} onChange={setSort} />
              </div>
            )}

            {showFilteredEmpty ? (
              <div className="py-12 text-center">
                <p className="font-medium text-slate-800">No reviews match your filters.</p>
                {hasActiveReviewFilters(filters) && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_REVIEW_FILTERS)}
                    className="mt-3 text-sm font-semibold text-[var(--iv-brand)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              processedReviews.length > 0 && <ReviewList reviews={processedReviews} />
            )}
          </>
        )}
      </div>

      {REVIEW_FEATURES.writeReview && (
        <WriteReviewDialog
          open={writeOpen}
          onOpenChange={setWriteOpen}
          productName={productName}
          productId={productId}
          onSubmitted={() => void refetch()}
        />
      )}
    </section>
  );
}

export const ProductReviewsSection = memo(ProductReviewsSectionInner);
