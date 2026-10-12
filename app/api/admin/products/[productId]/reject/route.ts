import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { notifyVendorProductRejected } from "@/lib/notifications/product-moderation";

/**
 * POST /api/admin/products/[productId]/reject — set product status to REJECTED and optional reason (admin only).
 * Body: { reason?: string } — note/reason for rejection (shown to vendor).
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

    let reason: string | undefined;
    try {
      const body = await request.json().catch(() => ({}));
      reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 2000) : undefined;
    } catch {
      // no body or invalid JSON — reason stays undefined
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true, name: true, sellerId: true, status: true },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    const wasAlreadyRejected = product.status === "REJECTED";

    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "REJECTED",
        rejectionReason: reason ?? null,
        updatedAt: new Date(),
      },
    });

    if (!wasAlreadyRejected) {
      void notifyVendorProductRejected({
        productId: product.id,
        sellerId: product.sellerId,
        productName: product.name?.trim() || "Your product",
        reason,
      }).catch(() => undefined);
    }

    return apiSuccess({ productId, status: "REJECTED", reason: reason ?? null });
  }
);
