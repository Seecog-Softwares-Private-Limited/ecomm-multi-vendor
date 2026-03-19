import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * POST /api/admin/products/[productId]/approve — set product status to ACTIVE (admin only).
 */
export const POST = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "products");
    if (ctx instanceof Response) return ctx;

    const params = context ? await context.params : {};
    const productId = typeof params.productId === "string" ? params.productId : "";
    if (!productId) {
      return apiNotFound("Product not found");
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    await prisma.product.update({
      where: { id: productId },
      data: { status: "ACTIVE" },
    });

    return apiSuccess({ productId, status: "ACTIVE" });
  }
);
