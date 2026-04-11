import { withApiHandler, apiSuccess, apiNotFound, apiBadRequest } from "@/lib/api";
import { getProductById, getProductBySlug } from "@/lib/data/products";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/** UUID pattern — 8-4-4-4-12 hex groups */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/products/:idOrSlug — single product detail.
 * Accepts either a UUID (legacy) or a SEO-friendly slug.
 */
export const GET = withApiHandler(async (_request, context?: RouteContext) => {
  const params = context?.params ? await context.params : {};
  const idOrSlug = typeof params.id === "string" ? params.id : params.id?.[0];

  if (!idOrSlug) return apiBadRequest("Product ID or slug is required");

  const product = UUID_RE.test(idOrSlug)
    ? await getProductById(idOrSlug)
    : await getProductBySlug(idOrSlug);

  if (!product) return apiNotFound("Product not found");

  return apiSuccess(product);
});
