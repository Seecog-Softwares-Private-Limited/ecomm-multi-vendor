"use client";

import * as React from "react";

type DataStateProps = {
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (message: string, retry?: () => void) => React.ReactNode;
  /** Pass refetch from useApi to show "Try again" in default error UI. */
  retry?: () => void;
};

const defaultLoading = (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-gray-600 font-medium">Loading...</p>
  </div>
);

const defaultError = (message: string, retry?: () => void) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <p className="text-red-600 font-medium">{message}</p>
    {retry && (
      <button
        type="button"
        onClick={retry}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700"
      >
        Try again
      </button>
    )}
  </div>
);

/**
 * Renders children when not loading and no error; otherwise loading or error UI.
 * Use with useApi or similar to keep components presentation-focused.
 */
export function DataState({
  isLoading,
  error,
  children,
  loadingFallback = defaultLoading,
  errorFallback = defaultError,
  retry,
}: DataStateProps) {
  if (isLoading) return <>{loadingFallback}</>;
  if (error) return <>{errorFallback(error, retry)}</>;
  return <>{children}</>;
}
