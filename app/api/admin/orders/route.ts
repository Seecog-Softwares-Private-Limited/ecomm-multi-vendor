import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getAdminOrders, type AdminOrderStatusFilter } from "@/lib/data/admin-orders";

/**
 * GET /api/admin/orders — list orders for admin with optional filters and stats.
import type { Prisma } from "@prisma/client";
import { OrderStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  Status,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const STATUS_MAP: Record<string, OrderStatus> = {
  placed: "PLACED",
  payment_confirmed: "PAYMENT_CONFIRMED",
  processing: "PROCESSING",
  shipped: "SHIPPED",
  out_for_delivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  returned: "RETURNED",
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function orderStatusToDisplay(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PLACED: "Placed",
    PAYMENT_CONFIRMED: "Payment confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
  };
  return map[s] ?? s;
}

/**
 * GET /api/admin/orders — list orders with summary stats (admin only).
 * Query: status, dateFrom, dateTo, page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status")?.trim() || "") as AdminOrderStatusFilter | "";
  const dateFrom = searchParams.get("dateFrom")?.trim() || undefined;
  const dateTo = searchParams.get("dateTo")?.trim() || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10) || 10));

  const result = await getAdminOrders({
    status: status || undefined,
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  return apiSuccess(result);
  const statusParam = searchParams.get("status")?.toLowerCase().replace(/-/g, "_") ?? "";
  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.OrderWhereInput = {};

  if (statusParam && STATUS_MAP[statusParam]) {
    where.status = STATUS_MAP[statusParam];
  }

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!isNaN(d.getTime())) dateFilter.gte = d;
  }
  if (dateTo) {
    const d = new Date(dateTo);
    if (!isNaN(d.getTime())) dateFilter.lte = d;
  }
  if (dateFilter.gte ?? dateFilter.lte) {
    where.createdAt = dateFilter;
  }

  const [list, total, agg] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { seller: { select: { businessName: true } } } },
        payments: { select: { status: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _count: true,
      _sum: { totalAmount: true },
    }),
  ]);

  const [pendingCount, deliveredCount] = await Promise.all([
    prisma.order.count({
      where: { ...where, status: { in: ["PLACED", "PAYMENT_CONFIRMED"] } },
    }),
    prisma.order.count({
      where: { ...where, status: "DELIVERED" },
    }),
  ]);

  const totalRevenue = Number(agg._sum.totalAmount ?? 0);
  const totalOrders = agg._count;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const orders = list.map((order) => {
    const customerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim();
    const customer = customerName || order.user?.email || "—";
    const sellerIds = [...new Set(order.items.map((i) => i.seller?.businessName).filter(Boolean))];
    const seller = sellerIds.length > 1 ? "Multiple" : sellerIds[0] ?? "—";
    const paymentStatus = order.payments?.some((p) => p.status === "PAID") ? "Paid" : "Pending";
    return {
      id: order.id,
      customer,
      seller,
      amount: Number(order.totalAmount),
      amountFormatted: formatMoney(Number(order.totalAmount)),
      paymentStatus,
      orderStatus: order.status,
      orderStatusDisplay: orderStatusToDisplay(order.status),
      date: order.createdAt.toISOString().slice(0, 10),
    };
  });

  const summary = {
    totalOrders,
    totalOrdersFormatted: totalOrders.toLocaleString(),
    totalRevenue,
    totalRevenueFormatted: formatMoney(totalRevenue),
    pendingOrders: pendingCount,
    pendingOrdersFormatted: pendingCount.toLocaleString(),
    completedOrders: deliveredCount,
    completedOrdersFormatted: deliveredCount.toLocaleString(),
  };

  return apiSuccess(
    { orders, summary },
    Status.OK,
    { total, page, pageSize, totalPages }
  );
});
