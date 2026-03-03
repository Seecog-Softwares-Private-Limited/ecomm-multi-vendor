import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/products/[productId]/reject — set product status to REJECTED (admin only).
 */
export const POST = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const session = await requireSession(request);
    if (session.role !== "ADMIN") {
      return apiForbidden("Admin access required");
    }

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
      data: { status: "REJECTED" },
    });

    return apiSuccess({ productId, status: "REJECTED" });
  }
);
