"use client";

import { useEffect } from "react";

const CHUNK_RELOAD_KEY = "__chunk_reload_attempted_at";
const RETRY_WINDOW_MS = 60_000;
const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Failed to fetch dynamically imported module/i,
];

function isChunkError(reason: unknown): boolean {
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : reason && typeof reason === "object" && "message" in reason
          ? String((reason as { message?: unknown }).message ?? "")
          : "";

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

export function ChunkLoadRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (!isChunkError(event.error ?? event.message)) return;
      void recoverFromChunkError();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isChunkError(event.reason)) return;
      void recoverFromChunkError();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
