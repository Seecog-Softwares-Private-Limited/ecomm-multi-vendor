import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiValidationError } from "@/lib/api";
import { getRatingFacetsForCategory } from "@/lib/data/products";

/**
 * GET /api/products/rating-facets — rating filter options for a category (for Customer Ratings sidebar).
 * Query: categorySlug (required), subCategorySlug (optional).
 * Returns { data: { minRating, label, count }[] } e.g. 5★, 4★+, 3★+, 2★+ with product counts.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug") ?? undefined;
  const subCategorySlug = searchParams.get("subCategorySlug") ?? undefined;

  if (!categorySlug?.trim()) {
    return apiValidationError("Validation failed", { categorySlug: "categorySlug is required" });
  }

  const facets = await getRatingFacetsForCategory({
    categorySlug: categorySlug.trim(),
    subCategorySlug: subCategorySlug?.trim(),
  });

  return apiSuccess(facets);
});
