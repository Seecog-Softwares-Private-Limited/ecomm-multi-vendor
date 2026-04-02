import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiValidationError } from "@/lib/api";
import { getProducts, getProductsByMenuType } from "@/lib/data/products";
import { getProductsQuerySchema, parseWithDetails } from "@/lib/validation";

/**
 * GET /api/products — list products.
 * Query: categorySlug?, subCategorySlug?, q?, limit?, offset?, pincode? (6 digits), menuType? (deals|new-arrivals|best-sellers)
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = {
    categorySlug: searchParams.get("categorySlug") ?? undefined,
    subCategorySlug: searchParams.get("subCategorySlug") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
    pincode: searchParams.get("pincode") ?? undefined,
    menuType: searchParams.get("menuType") ?? undefined,
  };

  const parsed = parseWithDetails(getProductsQuerySchema, query);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.details);
  }

  const limit =
    typeof parsed.data.limit === "number" ? parsed.data.limit : undefined;
  const offset =
    typeof parsed.data.offset === "number" ? parsed.data.offset : undefined;
  const pincode = parsed.data.pincode;
  const menuType = parsed.data.menuType;

  if (menuType) {
    const products = await getProductsByMenuType(menuType, {
      limit,
      offset,
      pincode,
      q: parsed.data.q,
    });
    return apiSuccess(products);
  }

  const products = await getProducts({
    categorySlug: parsed.data.categorySlug,
    subCategorySlug: parsed.data.subCategorySlug,
    q: parsed.data.q,
    limit,
    offset,
    pincode,
  });

  return apiSuccess(products);
});
