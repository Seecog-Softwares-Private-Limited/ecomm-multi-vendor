import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";
import {
  notifyVendorProductApproved,
  notifyVendorProductRejected,
} from "@/lib/notifications/product-moderation";

/**
 * PUT /api/superadmin/products/[productId]/status
 * Body: { action: "approve" | "reject" | "delete", reason?: string }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { productId } = await context.params;
  if (!productId?.trim()) {
    return Response.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action.toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : undefined;

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
    return Response.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  const nameTrim = product.name?.trim() || "Your product";

  if (action === "approve") {
    const wasPending = product.status === "PENDING_APPROVAL";
    await prisma.product.update({
      where: { id: productId },
      data: { status: "ACTIVE", rejectionReason: null },
    });
    await createAuditLog(
      session.id,
      session.email,
      "product_approve",
      "products",
      { productId },
      request
    );
    void notifyVendorProductApproved({
      productId: product.id,
      sellerId: product.sellerId,
      productName: nameTrim,
      phone: product.seller?.phone,
      sendSms: wasPending,
    }).catch(() => undefined);
    return Response.json({ success: true, data: { productId, status: "ACTIVE" } });
  }

  if (action === "reject") {
    const wasAlreadyRejected = product.status === "REJECTED";
    await prisma.product.update({
      where: { id: productId },
      data: { status: "REJECTED", rejectionReason: reason ?? null, updatedAt: new Date() },
    });
    await createAuditLog(
      session.id,
      session.email,
      "product_reject",
      "products",
      { productId, reason: reason ?? null },
      request
    );
    if (!wasAlreadyRejected) {
      void notifyVendorProductRejected({
        productId: product.id,
        sellerId: product.sellerId,
        productName: nameTrim,
        reason,
      }).catch(() => undefined);
    }
    return Response.json({
      success: true,
      data: { productId, status: "REJECTED", reason: reason ?? null },
    });
  }

  if (action === "delete") {
    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
    await createAuditLog(
      session.id,
      session.email,
      "product_delete",
      "products",
      { productId },
      request
    );
    return Response.json({ success: true, data: { productId, deleted: true } });
  }

  return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
}
