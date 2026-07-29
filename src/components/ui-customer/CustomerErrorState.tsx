"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

type CustomerErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showContinueShopping?: boolean;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CustomerErrorState({
  title = "Something went wrong",
  message = "We couldn't load this page. Check your connection and try again.",
  onRetry,
  retryLabel = "Retry",
  showContinueShopping = true,
  secondaryHref,
  secondaryLabel = "Go back",
  className = "",
}: CustomerErrorStateProps) {
  return (
    <div
      className={`iv-card flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12 ${className}`}
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className="iv-btn-primary min-w-[7rem]">
            {retryLabel}
          </button>
        )}
        {showContinueShopping && (
          <Link href="/" className="iv-btn-ghost min-w-[7rem]">
            Continue Shopping
          </Link>
        )}
        {!showContinueShopping && secondaryHref && (
          <Link href={secondaryHref} className="iv-btn-ghost min-w-[7rem]">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
