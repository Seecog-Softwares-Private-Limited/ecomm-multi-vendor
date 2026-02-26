import { withApiHandler, apiSuccess } from "@/lib/api";
import { getCategories } from "@/lib/data/categories";

/**
 * GET /api/categories — list all non-deleted categories for nav/home.
 */
export const GET = withApiHandler(async () => {
  const categories = await getCategories();
  return apiSuccess(categories);
});
