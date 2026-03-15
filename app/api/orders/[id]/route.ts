import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/[id] — get order details (customer's own order only).
 * Used for order confirmation page.
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view the order.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their orders.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id?.trim()) return apiNotFound("Order not found.");

  const order = await prisma.order.findFirst({
    where: { id, userId: session.sub },
    include: {
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { deletedAt: null },
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return apiNotFound("Order not found.");

  const address = order.shippingAddress;
  const items = order.items.map((oi) => ({
    id: oi.id,
    productId: oi.productId,
    productName: oi.product.name,
    imageUrl: oi.product.images[0]?.url ?? null,
    quantity: oi.quantity,
    unitPrice: Number(oi.unitPrice),
    totalPrice: Number(oi.totalPrice),
  }));

  return apiSuccess({
    order: {
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      discountAmount: order.discountAmount != null ? Number(order.discountAmount) : 0,
      taxAmount: order.taxAmount != null ? Number(order.taxAmount) : 0,
      shippingAmount: order.shippingAmount != null ? Number(order.shippingAmount) : 0,
      createdAt: order.createdAt.toISOString(),
      address: address
        ? {
            fullName: address.fullName,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
          }
        : null,
      items,
    },
  });
});
