import { withApiHandler, apiSuccess, apiNotFound, apiBadRequest } from "@/lib/api";
import { getProductBySlug } from "@/lib/data/products";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * GET /api/products/slug/:slug — fetch a single product by its SEO slug.
 */
export const GET = withApiHandler(async (_request, context?: RouteContext) => {
  const params = context?.params ? await context.params : {};
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];

  if (!slug) return apiBadRequest("Slug is required");

  const product = await getProductBySlug(slug);
  if (!product) return apiNotFound("Product not found");

  return apiSuccess(product);
});
