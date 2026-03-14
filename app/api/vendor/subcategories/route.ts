import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiBadRequest } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vendor/subcategories?categoryId= — list subcategories for a category (vendor only).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId")?.trim();
  if (!categoryId) {
    return apiBadRequest("categoryId query is required");
  }

  const list = await prisma.subCategory.findMany({
    where: { categoryId, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true },
  });

  return apiSuccess(list);
});
