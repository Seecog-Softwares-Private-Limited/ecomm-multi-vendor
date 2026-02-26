import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiValidationError } from "@/lib/api";
import { getProducts } from "@/lib/data/products";
import { getProductsQuerySchema, parseWithDetails } from "@/lib/validation";

/**
 * GET /api/products — list products with optional category/subcategory and pagination.
 * Query: categorySlug?, subCategorySlug?, limit?, offset?
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = {
    categorySlug: searchParams.get("categorySlug") ?? undefined,
    subCategorySlug: searchParams.get("subCategorySlug") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  };

  const parsed = parseWithDetails(getProductsQuerySchema, query);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.details);
  }

  const products = await getProducts({
    categorySlug: parsed.data.categorySlug,
    subCategorySlug: parsed.data.subCategorySlug,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });

  return apiSuccess(products);
});
