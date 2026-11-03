import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { parseBannerInput } from "@/lib/banners";

/**
 * PUT /api/admin/banners/[bannerId] — update a banner (admin only).
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const bannerId = typeof params.bannerId === "string" ? params.bannerId : "";
  const existing = await prisma.banner.findUnique({ where: { id: bannerId }, select: { id: true } });
  if (!existing) return apiNotFound("Banner not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const input = parseBannerInput(body);
  if (typeof input === "string") return apiBadRequest(input);

  const banner = await prisma.banner.update({ where: { id: bannerId }, data: input });
  return apiSuccess(banner);
});

/**
 * DELETE /api/admin/banners/[bannerId] — delete a banner (admin only).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const bannerId = typeof params.bannerId === "string" ? params.bannerId : "";
  const existing = await prisma.banner.findUnique({ where: { id: bannerId }, select: { id: true } });
  if (!existing) return apiNotFound("Banner not found");

  await prisma.banner.delete({ where: { id: bannerId } });
  return apiSuccess({ id: bannerId, deleted: true });
});
