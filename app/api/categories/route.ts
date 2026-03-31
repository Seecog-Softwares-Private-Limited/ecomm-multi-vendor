import { withApiHandler, apiSuccess } from "@/lib/api";
import { getCategories, getCategoryTree } from "@/lib/data/categories";

/**
 * GET /api/categories — list all non-deleted categories for nav/home.
 * Query: tree=1 — categories with nested subcategories (browse / department UI).
 */
export const GET = withApiHandler(async (request) => {
  const tree = new URL(request.url).searchParams.get("tree");
  if (tree === "1") {
    const categories = await getCategoryTree();
    return apiSuccess(categories);
  }
  const categories = await getCategories();
  return apiSuccess(categories);
});
