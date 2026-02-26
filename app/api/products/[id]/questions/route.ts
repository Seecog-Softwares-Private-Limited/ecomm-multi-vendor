import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiValidationError } from "@/lib/api";
import { getProductQuestions } from "@/lib/data/products";
import {
  productIdParamSchema,
  limitOnlyQuerySchema,
  parseWithDetails,
} from "@/lib/validation";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * GET /api/products/:id/questions — Q&A for a product.
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

  const questions = await getProductQuestions(
    idParsed.data.id,
    queryParsed.data.limit
  );
  return apiSuccess(questions);
});
