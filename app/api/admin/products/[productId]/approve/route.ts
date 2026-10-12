import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { notifyVendorProductApproved } from "@/lib/notifications/product-moderation";

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
      select: {
        id: true,
        name: true,
        sellerId: true,
        status: true,
        seller: { select: { phone: true } },
      },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    const nameTrim = product.name?.trim() || "Your product";
    const wasPendingApproval = product.status === "PENDING_APPROVAL";

    await prisma.product.update({
      where: { id: productId },
      data: { status: "ACTIVE", rejectionReason: null },
    });

    void notifyVendorProductApproved({
      productId: product.id,
      sellerId: product.sellerId,
      productName: nameTrim,
      phone: product.seller?.phone,
      sendSms: wasPendingApproval,
    }).catch(() => undefined);

    return apiSuccess({ productId, status: "ACTIVE", productName: nameTrim });
  }
);
