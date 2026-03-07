import { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  Status,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RECENT_ORDERS_LIMIT = 5;
const EXCLUDED_ORDER_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function orderStatusToDisplay(s: string): string {
  const map: Record<string, string> = {
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
 * GET /api/admin/dashboard — dashboard stats and recent orders (admin only).
 */
export const GET = withApiHandler(async (_request: NextRequest) => {
  const session = await requireSession(_request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const orderWhere = { status: { notIn: EXCLUDED_ORDER_STATUSES } };

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [
    gmvAgg,
    ordersThisMonth,
    ordersLastMonth,
    totalSellers,
    totalCommission,
    pendingKycCount,
    pendingReturnsCount,
    recentOrdersList,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.count({
      where: { ...orderWhere, createdAt: { gte: startOfThisMonth } },
    }),
    prisma.order.count({
      where: {
        ...orderWhere,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.seller.count({ where: { deletedAt: null } }),
    prisma.settlement.aggregate({ _sum: { commissionAmount: true } }),
    prisma.seller.count({
      where: {
        deletedAt: null,
        kycDocuments: { some: { status: "PENDING" } },
      },
    }),
    prisma.return.count({
      where: { deletedAt: null, status: "PENDING" },
    }),
    prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: "desc" },
      take: RECENT_ORDERS_LIMIT,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { seller: { select: { businessName: true } } } },
      },
    }),
  ]);

  const gmv = Number(gmvAgg._sum.totalAmount ?? 0);
  const totalOrders = gmvAgg._count;
  const revenue = Number(totalCommission._sum.commissionAmount ?? 0);

  const ordersChange =
    ordersLastMonth > 0
      ? (((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100).toFixed(1)
      : null;

  const recentOrders = recentOrdersList.map((order) => {
    const customerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim();
    const customer = customerName || order.user?.email || "—";
    const sellerNames = [...new Set(order.items.map((i) => i.seller?.businessName).filter(Boolean))];
    const seller = sellerNames.length > 1 ? "Multiple" : sellerNames[0] ?? "—";
    return {
      id: order.id,
      customer,
      seller,
      amountFormatted: formatMoney(Number(order.totalAmount)),
      status: orderStatusToDisplay(order.status),
      date: order.createdAt.toISOString().slice(0, 10),
    };
  });

  const stats = {
    gmv,
    gmvFormatted: formatMoney(gmv),
    gmvChange: null,
    totalOrders,
    totalOrdersFormatted: totalOrders.toLocaleString(),
    totalOrdersChange: ordersChange ? `${Number(ordersChange) >= 0 ? "+" : ""}${ordersChange}%` : null,
    totalSellers,
    totalSellersFormatted: totalSellers.toLocaleString(),
    totalSellersChange: null,
    revenue,
    revenueFormatted: formatMoney(revenue),
    revenueChange: null,
    pendingKyc: pendingKycCount,
    pendingKycFormatted: String(pendingKycCount),
    pendingKycChange: null,
    pendingReturns: pendingReturnsCount,
    pendingReturnsFormatted: String(pendingReturnsCount),
    pendingReturnsChange: null,
  };

  return apiSuccess({ stats, recentOrders }, Status.OK);
});
