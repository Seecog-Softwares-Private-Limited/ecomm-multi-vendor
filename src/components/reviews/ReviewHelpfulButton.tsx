"use client";

import { memo } from "react";
import { ThumbsUp } from "lucide-react";
import { REVIEW_FEATURES } from "@/lib/reviews/review-features";

type ReviewHelpfulButtonProps = {
  reviewId: string;
  count: number;
  voted?: boolean;
  onVote?: (reviewId: string) => void;
};

function ReviewHelpfulButtonInner({
  reviewId,
  count,
  voted = false,
  onVote,
}: ReviewHelpfulButtonProps) {
  if (!REVIEW_FEATURES.helpfulVote) {
    if (count <= 0) return null;
    return (
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
        {count.toLocaleString("en-IN")} found this helpful
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onVote?.(reviewId)}
      aria-pressed={voted}
      className={`mt-3 inline-flex min-h-[var(--iv-touch-min)] items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)] ${
        voted
          ? "border-[var(--iv-brand)] bg-[var(--iv-brand-muted)] text-[var(--iv-brand)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      <ThumbsUp className="h-4 w-4" aria-hidden />
      Helpful
      {count > 0 && (
        <span className="tabular-nums text-slate-500">({count.toLocaleString("en-IN")})</span>
      )}
    </button>
  );
}

export const ReviewHelpfulButton = memo(ReviewHelpfulButtonInner);
