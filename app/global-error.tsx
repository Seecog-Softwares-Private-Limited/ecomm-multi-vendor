"use client";

import { useMemo } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const CHUNK_RELOAD_KEY = "__chunk_reload_attempted_at";
const RETRY_WINDOW_MS = 60_000;
const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Failed to fetch dynamically imported module/i,
];

function isChunkLoadError(message: string): boolean {
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

async function clearClientCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Best effort only.
  }

  try {
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  } catch {
    // Best effort only.
  }
}

async function recoverFromChunkError() {
  const now = Date.now();
  const lastAttempt = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? "0");
  if (Number.isFinite(lastAttempt) && now - lastAttempt < RETRY_WINDOW_MS) {
    return;
  }

  window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
  await clearClientCaches();
  window.location.reload();
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const errorMessage = useMemo(() => error?.message || "", [error]);
  const chunkLoadError = useMemo(() => isChunkLoadError(errorMessage), [errorMessage]);

  const onTryAgain = () => {
    if (chunkLoadError) {
      void recoverFromChunkError();
      return;
    }

    reset();
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Application error</h1>
            <p className="text-gray-600 mb-6">
              {errorMessage || "A runtime error occurred. Please try again."}
            </p>
            <button
              type="button"
              onClick={onTryAgain}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-800 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

