import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ productId: string }> };

/**
 * POST /api/admin/products/[productId]/approve — set product status to ACTIVE (admin only).
 */
export const POST = withApiHandler(
  async (request: NextRequest, context?: RouteContext) => {
    const session = await requireSession(request);
    if (session.role !== "ADMIN") {
      return apiForbidden("Admin access required");
    }

    const params = context?.params;
    const productId = params ? (await params).productId : undefined;
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
