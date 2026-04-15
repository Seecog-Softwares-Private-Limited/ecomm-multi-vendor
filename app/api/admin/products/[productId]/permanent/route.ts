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
 * DELETE /api/admin/products/:productId/permanent — hard-delete a soft-deleted product.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
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

  const orderLines = await prisma.orderItem.count({ where: { productId } });
  if (orderLines > 0) {
    return apiBadRequest(
      "This product appears on customer orders and cannot be permanently deleted."
    );
  }

  await prisma.product.delete({ where: { id: productId } });

  return apiSuccess({ id: productId, permanentlyDeleted: true });
});
