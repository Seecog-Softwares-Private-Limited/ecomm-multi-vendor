"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{error.message || "An unexpected error occurred."}</p>
        <Button onClick={reset} variant="outline" className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
