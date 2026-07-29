"use client";

import { memo, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { StarRating } from "@/components/reviews/StarRating";
import { REVIEW_FEATURES } from "@/lib/reviews/review-features";

type WriteReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: string;
  onSubmitted?: () => void;
};

function WriteReviewDialogInner({
  open,
  onOpenChange,
  productName,
  productId,
  onSubmitted,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setRating(0);
    setTitle("");
    setComment("");
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write your review.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: REVIEW_FEATURES.reviewTitle ? title.trim() : undefined,
          comment: comment.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      onSubmitted?.();
      onOpenChange(false);
      reset();
    } catch {
      setError("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!REVIEW_FEATURES.writeReview) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Your rating</p>
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size={28}
            />
          </div>

          {REVIEW_FEATURES.reviewTitle && (
            <div>
              <label htmlFor="review-title" className="mb-1 block text-sm font-medium text-slate-700">
                Review title
              </label>
              <input
                id="review-title"
                type="text"
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
                placeholder="Summarize your experience"
              />
            </div>
          )}

          <div>
            <label htmlFor="review-comment" className="mb-1 block text-sm font-medium text-slate-700">
              Your review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
              placeholder="What did you like or dislike?"
              required
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="iv-btn-ghost"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="iv-btn-primary min-w-[7rem]" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const WriteReviewDialog = memo(WriteReviewDialogInner);
