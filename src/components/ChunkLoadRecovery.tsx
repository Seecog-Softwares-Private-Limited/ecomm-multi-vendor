"use client";

import { useEffect } from "react";
import { isChunkOrModuleLoadFailure } from "@/lib/chunk-load-errors";

const CHUNK_RELOAD_KEY = "__chunk_reload_attempted_at";
const RETRY_WINDOW_MS = 60_000;

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
    const onError = (event: Event) => {
      const t = event.target;
      if (t instanceof HTMLScriptElement && t.src.includes("/_next/")) {
        void recoverFromChunkError();
        return;
      }
      if (
        t instanceof HTMLLinkElement &&
        t.rel === "stylesheet" &&
        t.href.includes("/_next/")
      ) {
        void recoverFromChunkError();
        return;
      }
      if (event instanceof ErrorEvent) {
        if (isChunkOrModuleLoadFailure(event.error ?? event.message)) {
          void recoverFromChunkError();
        }
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isChunkOrModuleLoadFailure(event.reason)) return;
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
