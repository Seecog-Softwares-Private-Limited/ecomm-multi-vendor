"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { REVIEWS_PAGE_SIZE, type ProductReview } from "@/lib/reviews/review-utils";

type ReviewListProps = {
  reviews: ProductReview[];
};

/**
 * Renders reviews in pages; uses IntersectionObserver to load more as the user
 * scrolls — avoids mounting 100+ cards at once without adding a dependency.
 */
function ReviewListInner({ reviews }: ReviewListProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(REVIEWS_PAGE_SIZE);
  }, [reviews]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= reviews.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + REVIEWS_PAGE_SIZE, reviews.length));
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, reviews.length]);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <>
      <div role="list" aria-label="Customer reviews">
        {visibleReviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            animationDelayMs={Math.min(index * 40, 200)}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="py-6 text-center" aria-hidden>
          <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-slate-100" />
          <p className="mt-2 text-xs text-slate-500">
            Loading more reviews… ({visibleCount} of {reviews.length})
          </p>
        </div>
      )}
    </>
  );
}

export const ReviewList = memo(ReviewListInner);
