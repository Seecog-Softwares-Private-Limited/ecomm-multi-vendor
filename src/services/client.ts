/**
 * Reusable fetch wrapper for service-layer API calls.
 * Centralized error handling and typed responses; used by all domain services.
 */

import type { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { ServiceError } from "./errors";

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const port = process.env.PORT;
  return port ? `http://localhost:${port}` : "";
}

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Performs a typed request to the app API. Parses JSON and unwraps success payload.
 * Throws ServiceError on non-2xx or when API returns success: false.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body !== undefined && method !== "GET" && { body: JSON.stringify(body) }),
    credentials: "include",
  };

  let res: Response;
  let json: ApiSuccessResponse<T> | ApiErrorResponse | unknown;

  try {
    res = await fetch(url, init);
    const text = await res.text();
    try {
      json = text ? (JSON.parse(text) as unknown) : {};
    } catch (parseErr) {
      const preview = text.slice(0, 80).replace(/\s+/g, " ");
      const msg =
        res.ok === false
          ? `Server returned ${res.status} (expected JSON). Body: ${preview}${text.length > 80 ? "…" : ""}`
          : `Response was not valid JSON. Body: ${preview}${text.length > 80 ? "…" : ""}`;
      throw new ServiceError(msg, "INVALID_JSON", res.status, { cause: parseErr });
    }
  } catch (e) {
    if (e instanceof ServiceError) throw e;
    const message = e instanceof Error ? e.message : "Network request failed";
    throw new ServiceError(message, "NETWORK_ERROR", undefined, e);
  }

  if (isApiError(json as ApiResponse<unknown>)) {
    const { error } = json as ApiErrorResponse;
    throw new ServiceError(
      error.message,
      error.code,
      res.status,
      error.details
    );
  }

  if (!res.ok) {
    const fallback = (json as { error?: { message?: string } })?.error?.message ?? res.statusText;
    throw new ServiceError(fallback, "HTTP_ERROR", res.status);
  }

  const success = json as ApiSuccessResponse<T>;
  return success.data as T;
}
