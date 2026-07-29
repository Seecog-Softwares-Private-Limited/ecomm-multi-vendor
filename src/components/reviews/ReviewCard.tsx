"use client";

import { memo, useState, useCallback } from "react";
import { BadgeCheck } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewPhotoGallery } from "@/components/reviews/ReviewPhotoGallery";
import { ReviewHelpfulButton } from "@/components/reviews/ReviewHelpfulButton";
import { REVIEW_FEATURES } from "@/lib/reviews/review-features";
import { formatReviewDate, userInitials, type ProductReview } from "@/lib/reviews/review-utils";

type ReviewCardProps = {
  review: ProductReview;
  animationDelayMs?: number;
};

function ReviewCardInner({ review, animationDelayMs = 0 }: ReviewCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = useCallback((index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }, []);

  const hasPhotos = REVIEW_FEATURES.reviewPhotos && review.photoUrls.length > 0;

  return (
    <article
      className="iv-enter border-b border-slate-100 py-5 last:border-b-0 sm:py-6"
      style={{ animationDelay: `${animationDelayMs}ms` }}
      aria-label={`Review by ${review.user}`}
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-sm font-bold text-[var(--iv-brand)]"
          aria-hidden
        >
          {userInitials(review.user)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{review.user}</h3>
            {review.verified && REVIEW_FEATURES.verifiedBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Verified Purchase
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating rating={review.rating} size={14} label={`${review.rating} stars`} />
            <time className="text-xs text-slate-500" dateTime={review.date}>
              {formatReviewDate(review.date)}
            </time>
          </div>

          {REVIEW_FEATURES.reviewTitle && review.title && (
            <p className="mt-2 text-sm font-semibold text-slate-900">{review.title}</p>
          )}

          {REVIEW_FEATURES.reviewVariant && review.variant && (
            <p className="mt-1 text-xs text-slate-500">Variant: {review.variant}</p>
          )}

          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.comment}</p>
          )}

          {hasPhotos && REVIEW_FEATURES.reviewPhotos && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Review photos">
              {review.photoUrls.map((url, index) => (
                <li key={`${review.id}-photo-${index}`}>
                  <button
                    type="button"
                    onClick={() => openGallery(index)}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)] sm:h-20 sm:w-20"
                    aria-label={`Open review photo ${index + 1} of ${review.photoUrls.length}`}
                  >
                    <ProductImage
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {REVIEW_FEATURES.helpfulCount && (
            <ReviewHelpfulButton reviewId={review.id} count={review.helpful} />
          )}
        </div>
      </div>

      {hasPhotos && (
        <ReviewPhotoGallery
          photos={review.photoUrls}
          open={galleryOpen}
          initialIndex={galleryIndex}
          onOpenChange={setGalleryOpen}
        />
      )}
    </article>
  );
}

export const ReviewCard = memo(ReviewCardInner, (prev, next) => prev.review.id === next.review.id);
