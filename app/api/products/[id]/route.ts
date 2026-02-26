import { withApiHandler, apiSuccess, apiNotFound, apiValidationError } from "@/lib/api";
import { getProductById } from "@/lib/data/products";
import { productIdParamSchema, parseWithDetails } from "@/lib/validation";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * GET /api/products/:id — single product detail.
 */
export const GET = withApiHandler(async (_request, context?: RouteContext) => {
  const params = context?.params ? await context.params : {};
  const raw = { id: typeof params.id === "string" ? params.id : params.id?.[0] };

  const parsed = parseWithDetails(productIdParamSchema, raw);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.details);
  }

  const product = await getProductById(parsed.data.id);
  if (!product) return apiNotFound("Product not found");

  return apiSuccess(product);
});
