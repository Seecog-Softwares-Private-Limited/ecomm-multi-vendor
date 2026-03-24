import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isValidCmsFooterSlug } from "@/lib/cms-footer-pages";

/**
 * GET /api/cms/footer-pages/[slug] — public CMS page body for storefront.
 */
export const GET = withApiHandler(
  async (_request: NextRequest, context?: ApiRouteContext) => {
    const params = context ? await context.params : {};
    const slug = typeof params.slug === "string" ? params.slug : "";
    if (!slug || !isValidCmsFooterSlug(slug)) {
      return apiBadRequest("Invalid page");
    }
    const row = await prisma.cmsFooterPage.findUnique({
      where: { slug },
      select: { slug: true, title: true, content: true, updatedAt: true },
    });
    if (!row) return apiNotFound("Page not found");
    return apiSuccess(row);
  }
);
