import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { SettlementStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

const PAGE_SIZE = 10;
const STATUS_MAP: Record<string, SettlementStatus> = {
  pending: "PENDING",
  processing: "PROCESSING",
  completed: "COMPLETED",
};

function formatRupee(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * GET /api/admin/settlements — list settlements with summary stats (admin only).
 * Query: status (pending|processing|completed), dateFrom (YYYY-MM-DD), dateTo (YYYY-MM-DD), page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "settlements");
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toLowerCase() ?? "";
  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.SettlementWhereInput = {};

  if (statusParam && STATUS_MAP[statusParam]) {
    where.status = STATUS_MAP[statusParam];
  }

  const periodEnd: { gte?: Date; lte?: Date } = {};
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!isNaN(d.getTime())) periodEnd.gte = d;
  }
  if (dateTo) {
    const d = new Date(dateTo);
    if (!isNaN(d.getTime())) periodEnd.lte = d;
  }
  if (periodEnd.gte ?? periodEnd.lte) {
    where.periodEnd = periodEnd;
  }

  const [list, agg] = await Promise.all([
    prisma.settlement.findMany({
      where,
      include: { seller: { select: { businessName: true } } },
      orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.settlement.aggregate({
      where,
      _sum: { commissionAmount: true, payoutAmount: true },
    }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pendingSum, completedThisMonthSum] = await Promise.all([
    prisma.settlement.aggregate({
      where: { ...where, status: "PENDING" },
      _sum: { payoutAmount: true },
    }),
    prisma.settlement.aggregate({
      where: { ...where, status: "COMPLETED", periodEnd: { gte: startOfMonth } },
      _sum: { payoutAmount: true },
    }),
  ]);

  let total = await prisma.settlement.count({ where });

  const totalCommission = Number(agg._sum.commissionAmount ?? 0);
  const totalPayout = Number(agg._sum.payoutAmount ?? 0);
  const pendingAmount = Number(pendingSum._sum.payoutAmount ?? 0);
  const completedThisMonth = Number(completedThisMonthSum._sum.payoutAmount ?? 0);

  let settlements = list.map((s) => ({
    id: s.id,
    seller: s.seller.businessName,
    revenue: Number(s.revenue),
    commission: Number(s.commissionAmount),
    payout: Number(s.payoutAmount),
    status: s.status,
    date: s.periodEnd.toISOString().slice(0, 10),
  }));

  // Fallback: if no settlement records exist yet, derive a pending view from order items
  // so the dashboard still shows meaningful payout estimates.
  if (total === 0) {
    const canUsePendingFallback = !statusParam || statusParam === "pending";
    if (canUsePendingFallback) {
      const fallbackOrderItemWhere: Prisma.OrderItemWhereInput = {
        order: {
          status: { in: ["PLACED", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] },
          ...(periodEnd.gte ?? periodEnd.lte ? { createdAt: dateFilterFromPeriod(periodEnd) } : {}),
        },
      };
      const fallbackItems = await prisma.orderItem.findMany({
        where: fallbackOrderItemWhere,
        select: {
          sellerId: true,
          totalPrice: true,
          order: { select: { createdAt: true } },
          seller: { select: { businessName: true } },
        },
      });
      const grouped = new Map<string, { seller: string; revenue: number; lastDate: Date }>();
      for (const item of fallbackItems) {
        const entry = grouped.get(item.sellerId);
        const sellerName = item.seller?.businessName ?? "Unknown Seller";
        const rev = Number(item.totalPrice ?? 0);
        const createdAt = item.order.createdAt;
        if (entry) {
          entry.revenue += rev;
          if (createdAt > entry.lastDate) entry.lastDate = createdAt;
        } else {
          grouped.set(item.sellerId, { seller: sellerName, revenue: rev, lastDate: createdAt });
        }
      }
      settlements = Array.from(grouped.entries())
        .map(([sellerId, v]) => {
          const commission = v.revenue * 0.1;
          const payout = v.revenue - commission;
          return {
            id: `fallback-${sellerId}`,
            seller: v.seller,
            revenue: v.revenue,
            commission,
            payout,
            status: "PENDING" as const,
            date: v.lastDate.toISOString().slice(0, 10),
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice((page - 1) * pageSize, page * pageSize);

      const fallbackTotals = Array.from(grouped.values()).reduce(
        (acc, v) => {
          const commission = v.revenue * 0.1;
          const payout = v.revenue - commission;
          acc.totalCommission += commission;
          acc.totalPayout += payout;
          return acc;
        },
        { totalCommission: 0, totalPayout: 0 }
      );

      total = grouped.size;
      const fallbackPendingAmount = fallbackTotals.totalPayout;
      return apiSuccess(
        {
          summary: {
            totalCommission: fallbackTotals.totalCommission,
            totalPayout: fallbackTotals.totalPayout,
            pendingAmount: fallbackPendingAmount,
            completedThisMonth: 0,
          },
          settlements,
          totalCommissionFormatted: formatRupee(fallbackTotals.totalCommission),
          totalPayoutFormatted: formatRupee(fallbackTotals.totalPayout),
          pendingFormatted: formatRupee(fallbackPendingAmount),
          completedThisMonthFormatted: formatRupee(0),
        },
        Status.OK,
        {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1,
        }
      );
    }
  }

  return apiSuccess(
    {
      summary: {
        totalCommission,
        totalPayout,
        pendingAmount,
        completedThisMonth,
      },
      settlements,
      totalCommissionFormatted: formatRupee(totalCommission),
      totalPayoutFormatted: formatRupee(totalPayout),
      pendingFormatted: formatRupee(pendingAmount),
      completedThisMonthFormatted: formatRupee(completedThisMonth),
    },
    Status.OK,
    {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    }
  );
});

function dateFilterFromPeriod(periodEnd: { gte?: Date; lte?: Date }): { gte?: Date; lte?: Date } {
  const f: { gte?: Date; lte?: Date } = {};
  if (periodEnd.gte) f.gte = periodEnd.gte;
  if (periodEnd.lte) f.lte = periodEnd.lte;
  return f;
}
