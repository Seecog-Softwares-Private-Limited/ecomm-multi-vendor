import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

const toNum = (v: unknown): number => (typeof v === "number" ? v : Number(v) ?? 0);

export type AdminOrderStatusFilter =
  | "PLACED"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface AdminOrderListItem {
  id: string;
  orderId: string;
  customer: string;
  seller: string;
  amount: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
  createdAt: string;
}

export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface AdminOrdersResult {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: AdminOrderStats;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function mapOrderStatus(s: string): string {
  const map: Record<string, string> = {
    PLACED: "Pending",
    PAYMENT_CONFIRMED: "Payment Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
  };
  return map[s] ?? s;
}

function mapPaymentStatus(s: string): string {
  const map: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    PARTIALLY_REFUNDED: "Partially Refunded",
  };
  return map[s] ?? s;
}

/**
 * List orders for admin with optional status and date filters, pagination, and aggregate stats.
 */
export async function getAdminOrders(params: {
  status?: AdminOrderStatusFilter | "";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminOrdersResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (params.dateFrom) dateFilter.gte = new Date(params.dateFrom + "T00:00:00.000Z");
  if (params.dateTo) dateFilter.lte = new Date(params.dateTo + "T23:59:59.999Z");
  const hasDateFilter = params.dateFrom || params.dateTo;

  const where = {
    ...(params.status ? { status: params.status as OrderStatus } : {}),
    ...(hasDateFilter ? { createdAt: dateFilter } : {}),
  };

  const pendingStatuses: OrderStatus[] = [
    "PLACED",
    "PAYMENT_CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
  ];
  const completedWhere = { ...where, status: "DELIVERED" as OrderStatus };
  const pendingWhere = { ...where, status: { in: pendingStatuses } };

  const [orders, total, agg, pendingCount, completedCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true } },
        shippingAddress: { select: { fullName: true } },
        items: {
          take: 1,
          include: { seller: { select: { businessName: true } } },
        },
        payments: { take: 1, orderBy: { createdAt: "desc" }, select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where, _count: { id: true }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: pendingWhere }),
    prisma.order.count({ where: completedWhere }),
  ]);

  const list: AdminOrderListItem[] = orders.map((o) => {
    const customer =
      [o.user?.firstName, o.user?.lastName].filter(Boolean).join(" ").trim() ||
      o.shippingAddress?.fullName ||
      "Customer";
    const seller = o.items[0]?.seller?.businessName ?? "—";
    const paymentStatus = o.payments[0] ? mapPaymentStatus(o.payments[0].status) : "Pending";

    return {
      id: o.id,
      orderId: `#ORD-${o.id.slice(0, 8).toUpperCase()}`,
      customer,
      seller,
      amount: toNum(o.totalAmount),
      paymentStatus,
      orderStatus: mapOrderStatus(o.status),
      date: formatDate(o.createdAt),
      createdAt: o.createdAt.toISOString(),
    };
  });

  return {
    orders: list,
    total,
    page,
    pageSize,
    stats: {
      totalOrders: total,
      totalRevenue: toNum(agg._sum.totalAmount),
      pendingOrders: pendingCount,
      completedOrders: completedCount,
    },
  };
}
