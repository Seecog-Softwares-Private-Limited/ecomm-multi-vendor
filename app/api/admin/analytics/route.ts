import { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];
const EXCLUDED_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

const PERIOD_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

function getDateRange(period: string): { start: Date; end: Date } {
  const days = PERIOD_DAYS[period] ?? 30;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatRupee(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * GET /api/admin/analytics — sales metrics, top sellers, top products (admin only).
 * Query: period (7d|30d|3m|6m|1y). Default 30d.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const { searchParams } = new URL(request.url);
  const periodKey = searchParams.get("period")?.toLowerCase() ?? "30d";
  const period = Object.keys(PERIOD_DAYS).includes(periodKey) ? periodKey : "30d";
  const { start, end } = getDateRange(period);

  const orderWhere = {
    createdAt: { gte: start, lte: end },
    status: { notIn: EXCLUDED_STATUSES },
  };

  const [currentAgg, previousAgg, orderItems] = await Promise.all([
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          lte: new Date(start.getTime() - 1),
          gte: new Date(start.getTime() - (end.getTime() - start.getTime())),
        },
        status: { notIn: EXCLUDED_STATUSES },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.orderItem.findMany({
      where: { order: orderWhere },
      select: {
        sellerId: true,
        orderId: true,
        productId: true,
        totalPrice: true,
        quantity: true,
        seller: { select: { businessName: true } },
        product: { select: { name: true, category: { select: { name: true } } } },
      },
    }),
  ]);

  const totalRevenue = Number(currentAgg._sum.totalAmount ?? 0);
  const totalOrders = currentAgg._count;
  const prevRevenue = Number(previousAgg._sum.totalAmount ?? 0);
  const prevOrders = previousAgg._count;

  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const aovChange = prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : 0;

  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

  // Top sellers: by revenue from order items
  const sellerMap = new Map<
    string,
    { name: string; revenue: number; orderIds: Set<string> }
  >();
  for (const item of orderItems) {
    const rev = Number(item.totalPrice);
    const name = item.seller?.businessName ?? "Unknown";
    const existing = sellerMap.get(item.sellerId);
    if (existing) {
      existing.revenue += rev;
      existing.orderIds.add(item.orderId);
    } else {
      sellerMap.set(item.sellerId, {
        name,
        revenue: rev,
        orderIds: new Set([item.orderId]),
      });
    }
  }
  const topSellers = Array.from(sellerMap.entries())
    .map(([, v]) => ({ name: v.name, revenue: v.revenue, orders: v.orderIds.size }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((s, i) => ({
      rank: i + 1,
      name: s.name,
      revenue: formatRupee(s.revenue),
      orders: s.orders,
      growth: "+0%", // placeholder; could compute from previous period
    }));

  // Top products: by quantity (sales) and revenue
  const productMap = new Map<
    string,
    { name: string; category: string; sales: number; revenue: number }
  >();
  for (const item of orderItems) {
    const rev = Number(item.totalPrice);
    const qty = item.quantity;
    const name = item.product?.name ?? "Unknown";
    const category = item.product?.category?.name ?? "Uncategorized";
    const existing = productMap.get(item.productId);
    if (existing) {
      existing.sales += qty;
      existing.revenue += rev;
    } else {
      productMap.set(item.productId, {
        name,
        category,
        sales: qty,
        revenue: rev,
      });
    }
  }
  const topProducts = Array.from(productMap.entries())
    .map(([, v]) => v)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      category: p.category,
      sales: p.sales,
      revenue: formatRupee(p.revenue),
    }));

  const fmt = (n: number) => (n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`);

  return apiSuccess({
    period,
    metrics: {
      totalRevenue: formatRupee(totalRevenue),
      totalRevenueChange: revenueChange,
      totalRevenueChangeFormatted: `${fmt(revenueChange)} vs last period`,
      totalOrders: totalOrders.toLocaleString(),
      totalOrdersChange: ordersChange,
      totalOrdersChangeFormatted: `${fmt(ordersChange)} vs last period`,
      averageOrderValue: formatRupee(aov),
      averageOrderValueChange: aovChange,
      averageOrderValueChangeFormatted: `${fmt(aovChange)} vs last period`,
      conversionRate: "—",
      conversionRateChange: 0,
      conversionRateChangeFormatted: "— vs last period",
    },
    topSellers,
    topProducts,
  });
});
