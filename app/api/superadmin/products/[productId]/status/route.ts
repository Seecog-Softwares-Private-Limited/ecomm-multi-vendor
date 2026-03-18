import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";

/**
 * PUT /api/superadmin/products/[productId]/status
 * Body: { action: "approve" | "reject" | "delete", reason?: string }
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ productId: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { productId } = await context.params;
  if (!productId?.trim()) {
    return Response.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action.toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : undefined;

  const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null }, select: { id: true } });
  if (!product) return Response.json({ success: false, message: "Product not found" }, { status: 404 });

  if (action === "approve") {
    await prisma.product.update({ where: { id: productId }, data: { status: "ACTIVE", rejectionReason: null } });
    await createAuditLog(session.id, session.email, "product_approve", "products", { productId }, request);
    return Response.json({ success: true, data: { productId, status: "ACTIVE" } });
  }

  if (action === "reject") {
    await prisma.product.update({
      where: { id: productId },
      data: { status: "REJECTED", rejectionReason: reason ?? null, updatedAt: new Date() },
    });
    await createAuditLog(session.id, session.email, "product_reject", "products", { productId, reason: reason ?? null }, request);
    return Response.json({ success: true, data: { productId, status: "REJECTED", reason: reason ?? null } });
  }

  if (action === "delete") {
    await prisma.product.update({ where: { id: productId }, data: { deletedAt: new Date(), updatedAt: new Date() } });
    await createAuditLog(session.id, session.email, "product_delete", "products", { productId }, request);
    return Response.json({ success: true, data: { productId, deleted: true } });
  }

  return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
}

