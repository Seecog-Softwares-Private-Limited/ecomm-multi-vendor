"use client";

import { memo } from "react";
import { Star } from "lucide-react";

function ReviewEmptyStateInner() {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center sm:py-16">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500"
        aria-hidden
      >
        <Star className="h-9 w-9 fill-amber-400 text-amber-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">No Reviews Yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Be the first customer to review this product.
      </p>
    </div>
  );
}

export const ReviewEmptyState = memo(ReviewEmptyStateInner);
