import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE } from "@/lib/notifications/product-moderation";
import { getSmsNotificationService } from "@/services/sms-notification.service";

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

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { status: "ACTIVE" },
      }),
      prisma.notification.create({
        data: {
          type: "SELLER",
          title: SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE,
          message: `"${nameTrim}" has been approved and is now live in the storefront.`,
          sellerId: product.sellerId,
        },
      }),
    ]);

    // SMS only when product moves pending → live (not if already ACTIVE).
    if (wasPendingApproval) {
      getSmsNotificationService().onProductApproval({
        phone: product.seller?.phone,
        productName: nameTrim,
      });
    }

    return apiSuccess({ productId, status: "ACTIVE", productName: nameTrim });
  }
);
