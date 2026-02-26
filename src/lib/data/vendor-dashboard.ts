import { prisma } from "@/lib/prisma";
import { getVendorOrdersBySellerId } from "./vendor-orders";
import { getVendorProductsBySellerId } from "./vendor-products";

const toNumber = (v: unknown): number =>
  typeof v === "number" ? v : Number(v) ?? 0;

/** Low stock threshold for dashboard alert. */
const LOW_STOCK_THRESHOLD = 10;

export interface VendorDashboardRecentOrder {
  id: string;
  displayId: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
  timeAgo: string;
}

export interface VendorDashboardLowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export interface VendorDashboardSummary {
  todayOrdersCount: number;
  pendingOrdersCount: number;
  totalRevenue30d: number;
  commission30d: number;
  netPayable: number;
  todayOrdersChangePercent: number | null;
  recentOrders: VendorDashboardRecentOrder[];
  lowStockProducts: VendorDashboardLowStockProduct[];
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function orderDisplayId(id: string): string {
  if (id.startsWith("#")) return id;
  return `#ORD-${id.slice(-6).toUpperCase()}`;
}

/**
 * Get dashboard summary for vendor: KPIs, recent orders, low stock.
 * Net payable = total net earnings (all time) minus sum of paid payouts.
 */
export async function getVendorDashboardSummary(
  sellerId: string
): Promise<VendorDashboardSummary> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  endOfToday.setMilliseconds(-1);

  const startOf30d = new Date(now);
  startOf30d.setDate(startOf30d.getDate() - 30);

  const [
    todayOrderIds,
    pendingCountResult,
    items30d,
    allTimeNetRows,
    paidPayoutsSum,
    ordersList,
    productsList,
    yesterdayOrderIds,
  ] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        sellerId,
        order: {
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      },
      select: { orderId: true },
      distinct: ["orderId"],
    }),
    prisma.orderItem.findMany({
      where: {
        sellerId,
        order: { status: { in: ["PLACED", "PAYMENT_CONFIRMED"] } },
      },
      select: { orderId: true },
      distinct: ["orderId"],
    }).then((rows) => rows.length),
    prisma.orderItem.findMany({
      where: {
        sellerId,
        order: { createdAt: { gte: startOf30d } },
      },
      select: {
        totalPrice: true,
        commissionAmount: true,
        netPayable: true,
      },
    }),
    prisma.orderItem.findMany({
      where: { sellerId },
      select: {
        totalPrice: true,
        commissionAmount: true,
        netPayable: true,
      },
    }),
    prisma.payout
      .findMany({
        where: { sellerId, status: "PAID" },
        select: { amount: true },
      })
      .then((rows) => rows.reduce((sum, r) => sum + toNumber(r.amount), 0)),
    getVendorOrdersBySellerId(sellerId),
    getVendorProductsBySellerId(sellerId),
    prisma.orderItem.findMany({
      where: {
        sellerId,
        order: {
          createdAt: {
            gte: new Date(startOfToday.getTime() - 86400000),
            lt: startOfToday,
          },
        },
      },
      select: { orderId: true },
      distinct: ["orderId"],
    }),
  ]);

  const todayOrdersCount = todayOrderIds.length;
  const yesterdayOrdersCount = yesterdayOrderIds.length;
  let todayOrdersChangePercent: number | null = null;
  if (yesterdayOrdersCount > 0) {
    todayOrdersChangePercent = Math.round(
      ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100
    );
  } else if (todayOrdersCount > 0) {
    todayOrdersChangePercent = 100;
  }

  const revenue30d = items30d.reduce((s, r) => s + toNumber(r.totalPrice), 0);
  const commission30d = items30d.reduce(
    (s, r) => s + toNumber(r.commissionAmount),
    0
  );

  const totalNetEarnings = allTimeNetRows.reduce((sum, row) => {
    const net = toNumber(row.netPayable);
    const fallback = toNumber(row.totalPrice) - toNumber(row.commissionAmount);
    return sum + (net || fallback);
  }, 0);
  const netPayable = Math.max(0, totalNetEarnings - paidPayoutsSum);

  const recentOrders: VendorDashboardRecentOrder[] = ordersList.slice(0, 5).map(
    (o) => ({
      id: o.id,
      displayId: orderDisplayId(o.id),
      date: o.date,
      customer: o.customer,
      amount: o.amount,
      status: o.status,
      timeAgo: formatTimeAgo(o.createdAt ?? new Date().toISOString()),
    })
  );

  const lowStockProducts: VendorDashboardLowStockProduct[] = productsList
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
    }));

  return {
    todayOrdersCount,
    pendingOrdersCount: pendingCountResult,
    totalRevenue30d: Math.round(revenue30d * 100) / 100,
    commission30d: Math.round(commission30d * 100) / 100,
    netPayable: Math.round(netPayable * 100) / 100,
    todayOrdersChangePercent,
    recentOrders,
    lowStockProducts,
  };
}
