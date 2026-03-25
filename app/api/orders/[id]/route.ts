import { OrderStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
];

async function buildCustomerOrderPayload(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      shippingAddress: true,
      statusEvents: { orderBy: { occurredAt: "asc" }, select: { status: true, note: true, occurredAt: true } },
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

  if (!order) return null;

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

  const timeline = order.statusEvents.map((e) => ({
    status: e.status,
    note: e.note ?? undefined,
    occurredAt: e.occurredAt.toISOString(),
  }));

  return {
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
      timeline,
    },
  };
}

/**
 * GET /api/orders/[id] — get order details (customer's own order only).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view the order.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their orders.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id?.trim()) return apiNotFound("Order not found.");

  const payload = await buildCustomerOrderPayload(id.trim(), session.sub);
  if (!payload) return apiNotFound("Order not found.");

  return apiSuccess(payload);
});

/**
 * PATCH /api/orders/[id] — customer cancel (before shipment).
 * Body: { "action": "cancel", "reason"?: string }
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update their orders.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id?.trim() : "";
  if (!id) return apiNotFound("Order not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object");
  }
  const action = (body as { action?: unknown }).action;
  if (action !== "cancel") {
    return apiBadRequest('Unsupported action. Use { "action": "cancel" }.');
  }

  const reasonRaw = (body as { reason?: unknown }).reason;
  const reason =
    typeof reasonRaw === "string" && reasonRaw.trim() ? reasonRaw.trim().slice(0, 500) : "";

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, userId: session.sub },
        select: { id: true, status: true },
      });
      if (!order) {
        throw new Error("NOT_FOUND");
      }
      if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
        throw new Error("NOT_CANCELLABLE");
      }

      const shippedOrDelivered = await tx.orderItem.findFirst({
        where: {
          orderId: id,
          status: { in: ["SHIPPED", "DELIVERED"] },
        },
      });
      if (shippedOrDelivered) {
        throw new Error("NOT_CANCELLABLE");
      }

      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      await tx.orderItem.updateMany({
        where: {
          orderId: id,
          status: { in: ["NEW", "ACCEPTED", "SHIPPED", "REJECTED"] },
        },
        data: { status: "CANCELLED" },
      });

      const note = reason
        ? `Cancelled by customer: ${reason}`
        : "Cancelled by customer";

      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: "CANCELLED",
          note,
        },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return apiNotFound("Order not found.");
    if (msg === "NOT_CANCELLABLE") {
      return apiBadRequest(
        "This order can no longer be cancelled. Contact support if you need help."
      );
    }
    throw e;
  }

  const payload = await buildCustomerOrderPayload(id, session.sub);
  if (!payload) return apiNotFound("Order not found.");

  return apiSuccess(payload);
});
