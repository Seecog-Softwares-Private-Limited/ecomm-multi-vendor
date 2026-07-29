"use client";

import { memo, useCallback } from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: number;
  /** Interactive star picker (1–max) */
  interactive?: boolean;
  onChange?: (rating: number) => void;
  label?: string;
  className?: string;
};

function StarRatingInner({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  label,
  className = "",
}: StarRatingProps) {
  const displayRating = Math.min(max, Math.max(0, rating));

  const handleKey = useCallback(
    (event: React.KeyboardEvent, star: number) => {
      if (!interactive || !onChange) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onChange(star);
      }
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        onChange(Math.min(max, star + 1));
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        onChange(Math.max(1, star - 1));
      }
    },
    [interactive, max, onChange]
  );

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={
        label ?? (interactive ? "Select rating" : `${displayRating} out of ${max} stars`)
      }
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = displayRating >= star - 0.25;
        const partial = !filled && displayRating > star - 1;

        if (interactive && onChange) {
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={Math.round(displayRating) === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => onChange(star)}
              onKeyDown={(e) => handleKey(e, star)}
              className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--iv-brand-ring)]"
            >
              <Star
                size={size}
                className={filled || partial ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                aria-hidden
              />
            </button>
          );
        }

        return (
          <Star
            key={star}
            size={size}
            className={filled ? "fill-amber-400 text-amber-400" : "text-slate-200"}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export const StarRating = memo(StarRatingInner);
