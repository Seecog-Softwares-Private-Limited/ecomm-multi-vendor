import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { getCmsFooterSection } from "@/lib/cms-footer-pages";

/**
 * GET /api/admin/cms/footer-pages?section=about-us — list CMS footer pages (admin).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const section = request.nextUrl.searchParams.get("section");
  if (section && !getCmsFooterSection(section)) {
    return apiBadRequest("Invalid section");
  }

  const where = section ? { sectionId: section } : {};

  const rows = await prisma.cmsFooterPage.findMany({
    where,
    orderBy: [{ sectionId: "asc" }, { slug: "asc" }],
    select: {
      slug: true,
      sectionId: true,
      title: true,
      updatedAt: true,
      content: true,
    },
  });

  return apiSuccess({ pages: rows });
});
