import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getProductReviewSummary } from "@/lib/data/reviews";
import { productIdParamSchema, parseWithDetails } from "@/lib/validation";

/**
 * GET /api/products/:id/reviews/summary
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const params = context?.params ? await context.params : {};
  const rawId = { id: typeof params.id === "string" ? params.id : params.id?.[0] };
  const idParsed = parseWithDetails(productIdParamSchema, rawId);
  if (!idParsed.success) {
    return apiBadRequest("Invalid product id");
  }

  const summary = await getProductReviewSummary(idParsed.data.id);
  return apiSuccess(summary);
});
