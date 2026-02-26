import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiMeta, ApiSuccessResponse } from "./types";
import { Status, type StatusCode } from "./status";

type ErrorResponse = NextResponse<ApiErrorResponse>;

/**
 * Build a standardized success JSON response.
 * Use in route handlers for successful operations.
 */
export function apiSuccess<T>(
  data: T,
  status: StatusCode = Status.OK,
  meta?: ApiMeta
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  };
  return NextResponse.json(body, { status });
}

/**
 * Build a standardized error JSON response.
 * Use in route handlers for errors; map known errors to appropriate status codes.
 */
export function apiError(
  message: string,
  status: StatusCode = Status.INTERNAL_SERVER_ERROR,
  code: string = "INTERNAL_ERROR",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}

/** 400 Bad Request — invalid or malformed request. */
export function apiBadRequest(message: string, details?: unknown): ErrorResponse {
  return apiError(message, Status.BAD_REQUEST, "BAD_REQUEST", details);
}

/** 401 Unauthorized — missing or invalid auth. */
export function apiUnauthorized(message: string = "Unauthorized"): ErrorResponse {
  return apiError(message, Status.UNAUTHORIZED, "UNAUTHORIZED");
}

/** 403 Forbidden — insufficient permissions. */
export function apiForbidden(message: string = "Forbidden"): ErrorResponse {
  return apiError(message, Status.FORBIDDEN, "FORBIDDEN");
}

/** 404 Not Found — resource does not exist. */
export function apiNotFound(message: string = "Resource not found"): ErrorResponse {
  return apiError(message, Status.NOT_FOUND, "NOT_FOUND");
}

/** 405 Method Not Allowed. */
export function apiMethodNotAllowed(
  message: string = "Method not allowed"
): ErrorResponse {
  return apiError(message, Status.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED");
}

/** 409 Conflict — e.g. duplicate resource. */
export function apiConflict(message: string, details?: unknown): ErrorResponse {
  return apiError(message, Status.CONFLICT, "CONFLICT", details);
}

/** 422 Unprocessable Entity — validation failed. */
export function apiValidationError(
  message: string,
  details?: unknown
): ErrorResponse {
  return apiError(message, Status.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", details);
}

/** 500 Internal Server Error — unexpected server error. */
export function apiInternalError(
  message: string = "An unexpected error occurred",
  details?: unknown
): ErrorResponse {
  return apiError(message, Status.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", details);
}

/** 204 No Content — success with no response body (e.g. DELETE). */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: Status.NO_CONTENT });
}
