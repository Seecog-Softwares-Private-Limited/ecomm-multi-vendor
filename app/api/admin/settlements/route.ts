import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { SettlementStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  Status,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const STATUS_MAP: Record<string, SettlementStatus> = {
  pending: "PENDING",
  processing: "PROCESSING",
  completed: "COMPLETED",
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

/**
 * GET /api/admin/settlements — list settlements with summary stats (admin only).
 * Query: status (pending|processing|completed), dateFrom (YYYY-MM-DD), dateTo (YYYY-MM-DD), page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

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

  const total = await prisma.settlement.count({ where });

  const totalCommission = Number(agg._sum.commissionAmount ?? 0);
  const totalPayout = Number(agg._sum.payoutAmount ?? 0);
  const pendingAmount = Number(pendingSum._sum.payoutAmount ?? 0);
  const completedThisMonth = Number(completedThisMonthSum._sum.payoutAmount ?? 0);

  const settlements = list.map((s) => ({
    id: s.id,
    seller: s.seller.businessName,
    revenue: Number(s.revenue),
    commission: Number(s.commissionAmount),
    payout: Number(s.payoutAmount),
    status: s.status,
    date: s.periodEnd.toISOString().slice(0, 10),
  }));

  return apiSuccess(
    {
      summary: {
        totalCommission,
        totalPayout,
        pendingAmount,
        completedThisMonth,
      },
      settlements,
      totalCommissionFormatted: formatMoney(totalCommission),
      totalPayoutFormatted: formatMoney(totalPayout),
      pendingFormatted: formatMoney(pendingAmount),
      completedThisMonthFormatted: formatMoney(completedThisMonth),
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
