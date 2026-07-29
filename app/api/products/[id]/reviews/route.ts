import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiValidationError,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getProductReviews } from "@/lib/data/products";
import { createProductReview } from "@/lib/data/reviews";
import {
  productIdParamSchema,
  limitOnlyQuerySchema,
  parseWithDetails,
} from "@/lib/validation";
import { z } from "zod";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

const createReviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
});

/**
 * GET /api/products/:id/reviews — reviews for a product.
 * Query: limit?
 */
export const GET = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const params = context?.params ? await context.params : {};
  const rawId = { id: typeof params.id === "string" ? params.id : params.id?.[0] };
  const idParsed = parseWithDetails(productIdParamSchema, rawId);
  if (!idParsed.success) {
    return apiValidationError("Validation failed", idParsed.details);
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = { limit: searchParams.get("limit") ?? undefined };
  const queryParsed = parseWithDetails(limitOnlyQuerySchema, rawQuery);
  if (!queryParsed.success) {
    return apiValidationError("Validation failed", queryParsed.details);
  }

  const limit =
    typeof queryParsed.data.limit === "number" ? queryParsed.data.limit : undefined;
  const reviews = await getProductReviews(idParsed.data.id, limit);
  return apiSuccess(reviews);
});

/**
 * POST /api/products/:id/reviews — create a review (delivered-order customers only).
 */
export const POST = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to write a review.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can write reviews.");

  const params = context?.params ? await context.params : {};
  const rawId = { id: typeof params.id === "string" ? params.id : params.id?.[0] };
  const idParsed = parseWithDetails(productIdParamSchema, rawId);
  if (!idParsed.success) {
    return apiValidationError("Validation failed", idParsed.details);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const parsed = createReviewBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const result = await createProductReview(
    session.sub,
    idParsed.data.id,
    parsed.data.rating,
    parsed.data.comment
  );

  if (result === "NOT_FOUND") return apiNotFound("Product not found.");
  if (result === "NOT_ELIGIBLE") {
    return apiForbidden("You can only review products from delivered orders.");
  }
  if (result === "DUPLICATE") {
    return apiBadRequest("You have already reviewed this product.");
  }

  return apiSuccess({ review: result });
});
