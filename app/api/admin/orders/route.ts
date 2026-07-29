import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { OrderStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

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

function formatRupee(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Matches what admins copy from the table (`#` + first 8 chars of UUID). */
function normalizeAdminOrderSearch(raw: string): string {
  return raw.trim().replace(/^#+/u, "").trim();
}

/**
 * Match customer search against user rows. Single token: substring on first/last/email.
 * Multiple tokens (e.g. "John Doe"): every token must appear in at least one of those fields
 * so full names shown in the table work even when first and last are stored separately.
 */
function userMatchesCustomerSearch(searchTerm: string): Prisma.UserWhereInput {
  const t = searchTerm.trim();
  if (!t) return {};

  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) {
    return {
      OR: [
        { firstName: { contains: t } },
        { lastName: { contains: t } },
        { email: { contains: t } },
      ],
    };
  }

  return {
    AND: tokens.map((token) => ({
      OR: [
        { firstName: { contains: token } },
        { lastName: { contains: token } },
        { email: { contains: token } },
      ],
    })),
  };
}

function orderStatusToDisplay(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Awaiting payment",
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

function returnStatusToDisplay(s: string): string {
  const map: Record<string, string> = {
    PENDING: "Requested",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    REFUNDED: "Refunded",
  };
  return map[s] ?? s;
}

/**
 * GET /api/admin/orders — list orders with summary stats (admin only).
 * Query: status, pending (1), payment (paid|unpaid), dateFrom, dateTo, search, page, pageSize.
 *
 * `payment` filters by Payment row status (what the admin table "Payment" column shows).
 * `status` filters by Order.fulfillment status — "Payment confirmed" is only the
 * PAYMENT_CONFIRMED step; use payment=paid to list all paid orders.
 * `pending=1` limits to early-stage orders (PLACED or PAYMENT_CONFIRMED); takes precedence over `status`.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "orders");
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toLowerCase().replace(/-/g, "_") ?? "";
  const pendingParam = searchParams.get("pending");
  const pendingBucket =
    pendingParam === "1" || pendingParam?.toLowerCase() === "true";
  const paymentParam = searchParams.get("payment")?.toLowerCase() ?? "";
  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  const searchRaw = searchParams.get("search")?.trim() ?? "";
  const searchTerm = normalizeAdminOrderSearch(searchRaw);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!isNaN(d.getTime())) dateFilter.gte = d;
  }
  if (dateTo) {
    const d = new Date(dateTo);
    if (!isNaN(d.getTime())) dateFilter.lte = d;
  }

  const filters: Prisma.OrderWhereInput[] = [];

  if (pendingBucket) {
    filters.push({ status: { in: ["PLACED", "PAYMENT_CONFIRMED"] } });
  } else if (statusParam && STATUS_MAP[statusParam]) {
    filters.push({ status: STATUS_MAP[statusParam] });
  }

  if (paymentParam === "paid") {
    filters.push({ payments: { some: { status: "PAID" } } });
  } else if (paymentParam === "unpaid") {
    filters.push({ NOT: { payments: { some: { status: "PAID" } } } });
  }

  if (dateFilter.gte ?? dateFilter.lte) {
    filters.push({ createdAt: dateFilter });
  }

  if (searchTerm) {
    filters.push({
      OR: [{ id: { contains: searchTerm } }, { user: userMatchesCustomerSearch(searchTerm) }],
    });
  }

  const where: Prisma.OrderWhereInput =
    filters.length === 0 ? {} : filters.length === 1 ? filters[0]! : { AND: filters };

  const summaryFilters: Prisma.OrderWhereInput[] = [];
  if (dateFilter.gte ?? dateFilter.lte) {
    summaryFilters.push({ createdAt: dateFilter });
  }
  if (searchTerm) {
    summaryFilters.push({
      OR: [{ id: { contains: searchTerm } }, { user: userMatchesCustomerSearch(searchTerm) }],
    });
  }
  const summaryWhere: Prisma.OrderWhereInput =
    summaryFilters.length === 0 ? {} : summaryFilters.length === 1 ? summaryFilters[0]! : { AND: summaryFilters };

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
        returns: { where: { deletedAt: null }, select: { status: true, createdAt: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where: summaryWhere,
      _count: true,
      _sum: { totalAmount: true },
    }),
  ]);

  const [pendingCount, deliveredCount, paidRevenueAgg, unpaidRevenueAgg] = await Promise.all([
    prisma.order.count({
      where: { ...summaryWhere, status: { in: ["PLACED", "PAYMENT_CONFIRMED"] } },
    }),
    prisma.order.count({
      where: { ...summaryWhere, status: "DELIVERED" },
    }),
    prisma.order.aggregate({
      where: { ...summaryWhere, payments: { some: { status: "PAID" } } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { ...summaryWhere, NOT: { payments: { some: { status: "PAID" } } } },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalOrders = agg._count;
  const totalRevenue = Number(agg._sum.totalAmount ?? 0);
  const paidAmount = Number(paidRevenueAgg._sum.totalAmount ?? 0);
  const unpaidAmount = Number(unpaidRevenueAgg._sum.totalAmount ?? 0);
  const totalPages = Math.ceil(total / pageSize) || 1;

  const orders = list.map((order) => {
    const customerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim();
    const customer = customerName || order.user?.email || "—";
    const sellerIds = [...new Set(order.items.map((i) => i.seller?.businessName).filter(Boolean))];
    const seller = sellerIds.length > 1 ? "Multiple" : sellerIds[0] ?? "—";
    const paymentStatus = order.payments?.some((p) => p.status === "PAID") ? "Paid" : "Pending";
    const latestReturn = [...(order.returns ?? [])].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const refundStatus = latestReturn ? returnStatusToDisplay(String(latestReturn.status)) : "No Return";
    return {
      id: order.id,
      customer,
      seller,
      amount: Number(order.totalAmount),
      amountFormatted: formatRupee(Number(order.totalAmount)),
      paymentStatus,
      refundStatus,
      orderStatus: order.status,
      orderStatusDisplay: orderStatusToDisplay(order.status),
      date: order.createdAt.toISOString().slice(0, 10),
    };
  });

  const summary = {
    totalOrders,
    totalOrdersFormatted: totalOrders.toLocaleString(),
    totalRevenue,
    totalRevenueFormatted: formatRupee(totalRevenue),
    paidAmount,
    paidAmountFormatted: formatRupee(paidAmount),
    unpaidAmount,
    unpaidAmountFormatted: formatRupee(unpaidAmount),
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
