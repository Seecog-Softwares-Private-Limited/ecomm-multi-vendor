import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

type RouteContext = { params: Promise<Record<string, string | string[]>> };

/**
 * POST /api/admin/products/:productId/restore — restore soft-deleted product from trash.
 */
export const POST = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const ctx = await requireAdminPermission(request, "products");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const productId = typeof params.productId === "string" ? params.productId : params.productId?.[0];
  if (!productId?.trim()) return apiBadRequest("Invalid product ID");

  const existing = await prisma.product.findFirst({
    where: { id: productId, deletedAt: { not: null } },
    select: { id: true },
  });
  if (!existing) return apiNotFound("Product not in trash or not found.");

  await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: null, updatedAt: new Date() },
  });

  return apiSuccess({ id: productId, restored: true });
});
