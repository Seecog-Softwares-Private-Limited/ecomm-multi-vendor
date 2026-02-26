import { NextRequest, NextResponse } from "next/server";
import { apiError, apiInternalError } from "./response";
import { Status } from "./status";

/** Context passed to route handlers (e.g. dynamic params). */
export type ApiRouteContext = {
  params?: Promise<Record<string, string | string[]>>;
};

/** Handler function that returns a NextResponse. */
export type ApiRouteHandler<T = unknown> = (
  request: NextRequest,
  context?: ApiRouteContext
) => Promise<NextResponse<T>>;

/**
 * Wraps an API route handler with try/catch and standardized error responses.
 * Use this for all API routes to ensure consistent error handling and status codes.
 *
 * @example
 * export const GET = withApiHandler(async (req, ctx) => {
 *   const params = ctx?.params ? await ctx.params : {};
 *   const { id } = params as { id?: string };
 *   if (!id) return apiBadRequest("Missing id");
 *   const data = await getItem(id);
 *   return apiSuccess(data);
 * });
 */
export function withApiHandler<T = unknown>(
  handler: ApiRouteHandler<T>
): ApiRouteHandler<T> {
  return async (
    request: NextRequest,
    context?: ApiRouteContext
  ): Promise<NextResponse<T>> => {
    try {
      return await handler(request, context);
    } catch (err) {
      return handleRouteError(err) as NextResponse<T>;
    }
  };
}

/**
 * Maps thrown errors to appropriate HTTP status and message.
 * Extend this for custom error classes (e.g. NotFoundError -> 404).
 */
function handleRouteError(err: unknown): NextResponse {
  if (err instanceof ApiRouteError) {
    return apiError(err.message, err.status, err.code, err.details);
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code?: string; meta?: { cause?: string } };
    if (prismaErr.code === "P2025") {
      return apiError("Record not found", Status.NOT_FOUND, "NOT_FOUND");
    }
  }

  const isDev = process.env.NODE_ENV === "development";
  const message =
    isDev && err instanceof Error
      ? err.message
      : "An unexpected error occurred";
  const details =
    isDev && err instanceof Error ? { stack: err.stack } : undefined;

  return apiInternalError(message, details);
}

/**
 * Throw this (or extend it) in route handlers to return a specific status/code.
 * Caught by withApiHandler and turned into a standardized error response.
 */
export class ApiRouteError extends Error {
  constructor(
    message: string,
    public readonly status: number = Status.INTERNAL_SERVER_ERROR,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiRouteError";
    Object.setPrototypeOf(this, ApiRouteError.prototype);
  }
}

/** Helpers for throwing common API errors (optional; can also use response helpers). */
export const throwNotFound = (message: string = "Resource not found") =>
  new ApiRouteError(message, Status.NOT_FOUND, "NOT_FOUND");
export const throwBadRequest = (message: string, details?: unknown) =>
  new ApiRouteError(message, Status.BAD_REQUEST, "BAD_REQUEST", details);
export const throwUnauthorized = (message: string = "Unauthorized") =>
  new ApiRouteError(message, Status.UNAUTHORIZED, "UNAUTHORIZED");
export const throwForbidden = (message: string = "Forbidden") =>
  new ApiRouteError(message, Status.FORBIDDEN, "FORBIDDEN");
export const throwConflict = (message: string, details?: unknown) =>
  new ApiRouteError(message, Status.CONFLICT, "CONFLICT", details);
export const throwValidation = (message: string, details?: unknown) =>
  new ApiRouteError(message, Status.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", details);
