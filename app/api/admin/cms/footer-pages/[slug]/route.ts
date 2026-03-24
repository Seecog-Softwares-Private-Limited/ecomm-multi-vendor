import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  apiValidationError,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { isValidCmsFooterSlug } from "@/lib/cms-footer-pages";

/**
 * GET /api/admin/cms/footer-pages/[slug] — single page for editor (admin).
 */
export const GET = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "cms");
    if (ctx instanceof Response) return ctx;

    const params = context ? await context.params : {};
    const slug = typeof params.slug === "string" ? params.slug : "";
    if (!slug || !isValidCmsFooterSlug(slug)) {
      return apiBadRequest("Invalid slug");
    }

    const row = await prisma.cmsFooterPage.findUnique({
      where: { slug },
      select: {
        slug: true,
        sectionId: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
    if (!row) return apiNotFound("Page not found");
    return apiSuccess(row);
  }
);

/**
 * PUT /api/admin/cms/footer-pages/[slug] — save HTML body (admin).
 * Body: { content: string }
 */
export const PUT = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "cms");
    if (ctx instanceof Response) return ctx;

    const params = context ? await context.params : {};
    const slug = typeof params.slug === "string" ? params.slug : "";
    if (!slug || !isValidCmsFooterSlug(slug)) {
      return apiBadRequest("Invalid slug");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiBadRequest("Invalid JSON body");
    }
    if (typeof body !== "object" || body === null) {
      return apiValidationError("Validation failed", { body: "Must be an object" });
    }
    const content = (body as Record<string, unknown>).content;
    if (typeof content !== "string") {
      return apiValidationError("Validation failed", { content: "Must be a string" });
    }

    const existing = await prisma.cmsFooterPage.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return apiNotFound("Page not found");

    await prisma.cmsFooterPage.update({
      where: { slug },
      data: { content },
    });

    return apiSuccess({ message: "Saved", slug });
  }
);
