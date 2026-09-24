"use client";

import { useEffect } from "react";
import { isCustomerNativeApp } from "@/lib/native-bridge";

/**
 * When running inside the Flutter Customer App WebView, establish an HttpOnly
 * cookie so backend APIs can detect the Customer App environment.
 *
 * Environment marker only — not auth.
 *
 * Retries briefly until the Flutter-injected window flag appears (cold-start race),
 * then POSTs once. Root layout mount + empty deps → not on every client navigation.
 */
export function CustomerNativeSessionMarker() {
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const maxAttempts = 40; // ~10s at 250ms

    const establish = () => {
      if (cancelled) return;

      if (!isCustomerNativeApp()) {
        attempts += 1;
        if (attempts < maxAttempts) {
          timer = setTimeout(establish, 250);
        }
        return;
      }

      void (async () => {
        try {
          await fetch("/api/auth/customer-app/marker", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          /* ignore — register/native-complete also set the cookie */
        }
      })();
    };

    establish();

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  return null;
}
