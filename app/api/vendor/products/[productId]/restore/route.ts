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
 * POST /api/vendor/products/:productId/restore — clear soft-delete (move out of trash).
 */
export const POST = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
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

  await prisma.product.update({
    where: { id },
    data: { deletedAt: null, updatedAt: new Date() },
  });

  return apiSuccess({ id, restored: true });
});
