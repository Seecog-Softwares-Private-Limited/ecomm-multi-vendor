import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { parseBannerInput } from "@/lib/banners";

/**
 * GET /api/admin/banners — list all banners, including inactive (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const banners = await prisma.banner.findMany({
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return apiSuccess(banners);
});

/**
 * POST /api/admin/banners — create a banner (admin only).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const input = parseBannerInput(body);
  if (typeof input === "string") return apiBadRequest(input);

  const banner = await prisma.banner.create({ data: input });
  return apiSuccess(banner, 201);
});
