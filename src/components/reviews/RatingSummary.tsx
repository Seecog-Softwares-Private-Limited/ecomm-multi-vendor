"use client";

import { memo, useEffect, useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import type { RatingDistribution } from "@/lib/reviews/review-utils";

type RatingSummaryProps = {
  avgRating: number;
  reviewCount: number;
  distribution: RatingDistribution;
  /** When loaded reviews are fewer than total count */
  sampleSize?: number;
};

function RatingSummaryInner({
  avgRating,
  reviewCount,
  distribution,
  sampleSize,
}: RatingSummaryProps) {
  const [animate, setAnimate] = useState(false);
  const totalForBars = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const showSampleNote =
    sampleSize != null && reviewCount > 0 && sampleSize < reviewCount && sampleSize > 0;

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [distribution, reviewCount]);

  if (reviewCount <= 0 && totalForBars <= 1 && Object.values(distribution).every((c) => c === 0)) {
    return null;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-8">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <p className="text-4xl font-extrabold tabular-nums text-slate-900 sm:text-5xl">
          {avgRating > 0 ? avgRating.toFixed(1) : "—"}
        </p>
        <StarRating
          rating={avgRating}
          size={22}
          className="mt-2"
          label={`Overall ${avgRating.toFixed(1)} stars`}
        />
        <p className="mt-2 text-sm text-slate-600">
          Based on{" "}
          <span className="font-semibold text-slate-800">
            {reviewCount.toLocaleString("en-IN")}
          </span>{" "}
          {reviewCount === 1 ? "review" : "reviews"}
        </p>
        {showSampleNote && (
          <p className="mt-1 text-xs text-slate-500">
            Breakdown from {sampleSize.toLocaleString("en-IN")} recent reviews
          </p>
        )}
      </div>

      <div className="flex flex-col justify-center gap-2" aria-label="Rating distribution">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star];
          const pct = Math.round((count / totalForBars) * 100);
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-sm font-medium text-slate-700">{star}★</span>
              <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-[width] duration-700 ease-out"
                  style={{ width: animate ? `${pct}%` : "0%" }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${star} star: ${pct}%`}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const RatingSummary = memo(RatingSummaryInner);
