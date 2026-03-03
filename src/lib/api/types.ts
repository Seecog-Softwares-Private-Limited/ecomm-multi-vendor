/**
 * Standardized API response types for Next.js App Router.
 * Use these types for type-safe responses across all API routes.
 */

/** Successful response payload. */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

/** Error response payload. */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Union of all API response shapes. */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Optional metadata for list responses (pagination, etc.). */
export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasMore?: boolean;
}

/** Type guard for success responses. */
export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccessResponse<T> {
  return res.success === true;
}

/** Type guard for error responses. */
export function isApiError(res: ApiResponse<unknown>): res is ApiErrorResponse {
  return res.success === false;
}
