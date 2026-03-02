import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vendor/category-document-requirements?categoryId= — list document names for a category (vendor only).
 * Returns all category document requirements (required and optional). Vendor may choose to upload or skip.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  if (!categoryId || !categoryId.trim()) {
    return apiBadRequest("categoryId query is required");
  }

  const list = await prisma.categoryDocumentRequirement.findMany({
    where: { categoryId: categoryId.trim(), deletedAt: null },
    select: { documentName: true, isRequired: true },
    orderBy: { documentName: "asc" },
  });

  return apiSuccess(list.map((r) => ({ documentName: r.documentName, isRequired: r.isRequired })));
});
