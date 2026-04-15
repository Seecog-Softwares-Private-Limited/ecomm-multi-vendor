import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uuid } from "@/lib/validation";

type RouteContext = { params: Promise<Record<string, string | string[]>> };

/**
 * DELETE /api/vendor/products/:productId/permanent — hard-delete a soft-deleted product.
 * Blocked if the product appears on any order (OrderItem).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const { sellerId } = await requireVendorApproved(request);

  const params = context ? await context.params : {};
  const productId = typeof params.productId === "string" ? params.productId : params.productId?.[0];
  const parsedId = uuid.safeParse(productId ?? "");
  if (!parsedId.success) {
    return apiBadRequest("Invalid product ID");
  }
  const id = parsedId.data;

  const existing = await prisma.product.findFirst({
    where: { id, sellerId, deletedAt: { not: null } },
    select: { id: true },
  });
  if (!existing) return apiNotFound("Product not in trash or not found.");

  const orderLines = await prisma.orderItem.count({ where: { productId: id } });
  if (orderLines > 0) {
    return apiBadRequest(
      "This product was purchased before and cannot be permanently deleted. Restore it or leave it in trash."
    );
  }

  await prisma.product.delete({ where: { id } });

  return apiSuccess({ id, permanentlyDeleted: true });
});
