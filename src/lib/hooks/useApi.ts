"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ServiceError } from "@/services/errors";

export type ApiState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

type UseApiFetcher<T> = () => Promise<T>;

/**
 * Client-side data fetch hook with loading and error state.
 *
 * Prefer passing a fetcher that uses the service layer so UI does not call APIs directly:
 *   useApi(() => catalogService.getCategories())
 *   useApi(() => authService.getSession())
 *
 * Legacy: useApi(url) still works but prefer service-based fetcher for typed APIs.
 */
export function useApi<T>(
  source: UseApiFetcher<T> | string | null,
  options?: RequestInit
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFetcher = typeof source === "function";
  const [isLoading, setIsLoading] = useState(isFetcher || !!source);

  const fetcherRef = useRef<UseApiFetcher<T> | null>(null);
  if (isFetcher) fetcherRef.current = source as UseApiFetcher<T>;

  const urlOrNull = typeof source === "string" ? source : null;

  const fetchData = useCallback(async () => {
    if (source == null) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFetcher && fetcherRef.current) {
        const result = await fetcherRef.current();
        setData(result);
      } else if (typeof source === "string") {
        const res = await fetch(source, {
          ...options,
          headers: { "Content-Type": "application/json", ...options?.headers },
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) {
          const message = json?.error?.message ?? json?.message ?? "Request failed";
          setError(message);
          setData(null);
          return;
        }
        setData(json.data ?? json);
      }
    } catch (e) {
      const message =
        e instanceof ServiceError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Network error";
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isFetcher, urlOrNull]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}
