import { NextRequest } from "next/server";
import { OrderStatus, PaymentMode, PaymentStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

const ORDER_STATUS_DISPLAY: Record<OrderStatus, string> = {
  PLACED: "Placed",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const PAYMENT_MODE_DISPLAY: Record<PaymentMode, string> = {
  PREPAID: "Prepaid",
  COD: "Cash on Delivery",
  WALLET: "Wallet",
  CARD: "Credit / Debit Card",
  UPI: "UPI",
  OTHER: "Other",
};

const PAYMENT_STATUS_DISPLAY: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
};

/**
 * GET /api/admin/orders/[orderId] — fetch single order with full details (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "orders");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const orderId = typeof params.orderId === "string" ? params.orderId : undefined;
  if (!orderId?.trim()) return apiNotFound("Order not found.");

  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
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
          seller: { select: { id: true, businessName: true, email: true } },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      statusEvents: { orderBy: { occurredAt: "asc" } },
    },
  });

  if (!order) return apiNotFound("Order not found.");

  const customerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim();
  const payment = order.payments[0];
  const address = order.shippingAddress;

  const orderResponse = {
    id: order.id,
    status: order.status,
    statusDisplay: ORDER_STATUS_DISPLAY[order.status],
    createdAt: order.createdAt.toISOString(),
    totalAmount: Number(order.totalAmount),
    discountAmount: order.discountAmount != null ? Number(order.discountAmount) : 0,
    taxAmount: order.taxAmount != null ? Number(order.taxAmount) : 0,
    shippingAmount: order.shippingAmount != null ? Number(order.shippingAmount) : 0,
    customer: {
      id: order.user?.id,
      name: customerName || order.user?.email || "—",
      email: order.user?.email ?? "",
      phone: order.user?.phone ?? "",
    },
    shippingAddress: address
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
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? "—",
      imageUrl: item.product?.images?.[0]?.url ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      seller: item.seller
        ? { id: item.seller.id, businessName: item.seller.businessName, email: item.seller.email }
        : null,
    })),
    payment: payment
      ? {
          mode: payment.mode,
          modeDisplay: PAYMENT_MODE_DISPLAY[payment.mode],
          status: payment.status,
          statusDisplay: PAYMENT_STATUS_DISPLAY[payment.status],
          amount: Number(payment.amount),
          transactionId: payment.transactionId,
          paidAt: payment.paidAt?.toISOString() ?? null,
        }
      : null,
    timeline: order.statusEvents.map((e) => ({
      status: e.status,
      statusDisplay: ORDER_STATUS_DISPLAY[e.status],
      note: e.note,
      occurredAt: e.occurredAt.toISOString(),
    })),
  };

  return apiSuccess({ order: orderResponse });
});
