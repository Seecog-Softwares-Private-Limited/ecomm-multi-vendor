import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiValidationError } from "@/lib/api";
import { getBrandsForCategory } from "@/lib/data/products";

/**
 * GET /api/products/brands — distinct brands for a category (for filter sidebar).
 * Query: categorySlug (required), subCategorySlug (optional).
 * Returns { data: string[] } sorted brand names.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug") ?? undefined;
  const subCategorySlug = searchParams.get("subCategorySlug") ?? undefined;

  if (!categorySlug?.trim()) {
    return apiValidationError("Validation failed", { categorySlug: "categorySlug is required" });
  }

  const brands = await getBrandsForCategory({
    categorySlug: categorySlug.trim(),
    subCategorySlug: subCategorySlug?.trim(),
  });

  return apiSuccess(brands);
});
