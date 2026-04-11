import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { VENDOR_KYC_LOCKED_ERROR } from "@/lib/data/vendor-profile";
import { apiError, apiInternalError } from "./response";
import { Status, type StatusCode } from "./status";

/** Context passed to route handlers (e.g. dynamic params). Next.js 15 requires params. */
export type ApiRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

/** Handler function that returns a NextResponse. Context is optional so routes without params can use (request) => ... */
export type ApiRouteHandler<T = unknown> = (
  request: NextRequest,
  context?: ApiRouteContext
) => Promise<NextResponse<T>>;

/** Next.js 15 expects the exported route handler to have a required second argument. */
type ExportedRouteHandler<T = unknown> = (
  request: NextRequest,
  context: ApiRouteContext
) => Promise<NextResponse<T>>;

/** Accepts any handler that returns a NextResponse; avoids strict return-type inference (success vs error) at each route. */
type AnyRouteHandler = (
  request: NextRequest,
  context?: ApiRouteContext
) => Promise<NextResponse<unknown>>;

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
export function withApiHandler(handler: AnyRouteHandler): ExportedRouteHandler<unknown> {
  return async (
    request: NextRequest,
    context: ApiRouteContext
  ): Promise<NextResponse<unknown>> => {
    try {
      return await handler(request, context);
    } catch (err) {
      return handleRouteError(err);
    }
  };
}

/**
 * Maps thrown errors to appropriate HTTP status and message.
 * Extend this for custom error classes (e.g. NotFoundError -> 404).
 */
function handleRouteError(err: unknown): NextResponse {
  if (err instanceof ApiRouteError) {
    return apiError(err.message, err.status as StatusCode, err.code, err.details);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    console.error("[api] Unique constraint:", err.meta);
    const fields: string[] = Array.isArray(err.meta?.target)
      ? (err.meta.target as string[])
      : typeof err.meta?.target === "string"
        ? [err.meta.target as string]
        : [];
    const f = fields.join(", ").toLowerCase();

    let message: string;
    if (f.includes("sku")) {
      message = "A product with this SKU already exists. Please use a different SKU.";
    } else if (f.includes("email") || f.includes("phone")) {
      message = "This email or phone is already in use. Sign in instead, or use a different email or phone.";
    } else if (f.includes("slug")) {
      message = "This URL slug is already taken. Please choose a different one.";
    } else if (f.includes("code")) {
      message = "This code is already in use. Please use a different one.";
    } else if (fields.length > 0) {
      message = `A record with this ${fields.join(" / ")} already exists.`;
    } else {
      message = "A record with these details already exists.";
    }

    return apiError(message, Status.CONFLICT, "UNIQUE_CONSTRAINT");
  }

  /** Wrong generated client vs schema, or query uses fields the client does not know */
  if (err instanceof Prisma.PrismaClientValidationError) {
    const msg = err.message;
    if (/Unknown field|Unknown argument|Invalid `.+` invocation/i.test(msg)) {
      console.error("[api] Prisma validation (client/schema mismatch):", msg.slice(0, 400));
      return apiError(
        "Server build is out of sync with the database schema. On the server: run npx prisma migrate deploy, then npm ci && npm run build (or redeploy), then restart the app.",
        Status.INTERNAL_SERVER_ERROR,
        "SCHEMA_MISMATCH"
      );
    }
  }

  const errMessage = err instanceof Error ? err.message : "";
  if (
    errMessage &&
    /Unknown column|does not exist in the current database|column .* does not exist/i.test(errMessage)
  ) {
    console.error("[api] Database column mismatch:", errMessage.slice(0, 400));
    return apiError(
      "Database is missing columns required by this app. On the server run: npx prisma migrate deploy (using the same DATABASE_URL as the app), then restart.",
      Status.INTERNAL_SERVER_ERROR,
      "DATABASE_SCHEMA"
    );
  }

  if (err instanceof Error && err.message === VENDOR_KYC_LOCKED_ERROR) {
    return apiError(
      "Your KYC has been approved. Business identity, documents, bank details, and categories can no longer be changed. You can still update your store display name, logo, description, website, and pickup pincode.",
      Status.FORBIDDEN,
      "KYC_LOCKED"
    );
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code?: string; meta?: { cause?: string }; message?: string };
    if (prismaErr.code === "P2025") {
      return apiError("Record not found", Status.NOT_FOUND, "NOT_FOUND");
    }
    if (prismaErr.code === "P2021") {
      console.error("[api] Prisma missing table:", prismaErr.message);
      return apiError(
        "Database schema is missing on this server. Run: npx prisma migrate deploy (same DATABASE_URL as the app).",
        Status.INTERNAL_SERVER_ERROR,
        "DATABASE_SCHEMA"
      );
    }
    if (prismaErr.code === "P2022") {
      console.error("[api] Prisma missing column:", prismaErr.message);
      return apiError(
        "Database is missing columns required by this app. On the server run: npx prisma migrate deploy, then restart the app.",
        Status.INTERNAL_SERVER_ERROR,
        "DATABASE_SCHEMA"
      );
    }
    // DB unreachable / connection refused / auth to MySQL failed
    const dbCodes = ["P1001", "P1000", "P1017", "P1008", "P1011"];
    if (prismaErr.code && dbCodes.includes(prismaErr.code)) {
      console.error("[api] Database error:", prismaErr.code, prismaErr.message);
      return apiError(
        "Database is unavailable. Check DATABASE_URL and that MySQL is reachable from this server.",
        Status.SERVICE_UNAVAILABLE,
        "DATABASE_UNAVAILABLE"
      );
    }
    if (prismaErr.code?.startsWith("P") && prismaErr.message) {
      console.error("[api] Prisma error:", prismaErr.code, prismaErr.message.slice(0, 300));
      return apiError(
        "A database error occurred. If you recently deployed, run npx prisma migrate deploy on the server and restart the app.",
        Status.INTERNAL_SERVER_ERROR,
        "DATABASE_ERROR"
      );
    }
  }

  console.error("[api] Unhandled route error:", err);

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
