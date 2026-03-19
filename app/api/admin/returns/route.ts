import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { ReturnStatus } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

const PAGE_SIZE = 10;
const STATUS_MAP: Record<string, ReturnStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
  refunded: "REFUNDED",
};

function formatRupee(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusToDisplay(s: ReturnStatus): string {
  const map: Record<ReturnStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    REFUNDED: "Refunded",
  };
  return map[s] ?? s;
}

/**
 * GET /api/admin/returns — list returns with summary stats (admin only).
 * Query: status (pending|approved|rejected|refunded), dateFrom, dateTo, page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "returns");
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toLowerCase() ?? "";
  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.ReturnWhereInput = { deletedAt: null };

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

  const [list, total, pendingCount, approvedCount, rejectedCount, refundedCount] = await Promise.all([
    prisma.return.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        order: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        seller: { select: { businessName: true } },
      },
    }),
    prisma.return.count({ where }),
    prisma.return.count({ where: { ...where, status: "PENDING" } }),
    prisma.return.count({ where: { ...where, status: "APPROVED" } }),
    prisma.return.count({ where: { ...where, status: "REJECTED" } }),
    prisma.return.count({ where: { ...where, status: "REFUNDED" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const returns = list.map((r) => {
    const customerName = [r.order?.user?.firstName, r.order?.user?.lastName].filter(Boolean).join(" ").trim();
    const customer = customerName || (r.order?.user?.email as string) || "—";
    return {
      id: r.id,
      orderId: r.orderId,
      seller: r.seller?.businessName ?? "—",
      customer,
      amount: Number(r.totalAmount),
      amountFormatted: formatRupee(Number(r.totalAmount)),
      reason: r.reason,
      status: r.status,
      statusDisplay: statusToDisplay(r.status),
      date: r.createdAt.toISOString().slice(0, 10),
    };
  });

  const summary = {
    totalReturns: total,
    totalReturnsFormatted: total.toLocaleString(),
    pendingReturns: pendingCount,
    pendingReturnsFormatted: pendingCount.toLocaleString(),
    approvedReturns: approvedCount,
    approvedReturnsFormatted: approvedCount.toLocaleString(),
    rejectedReturns: rejectedCount,
    rejectedReturnsFormatted: rejectedCount.toLocaleString(),
    refundedReturns: refundedCount,
    refundedReturnsFormatted: refundedCount.toLocaleString(),
  };

  return apiSuccess(
    { returns, summary },
    Status.OK,
    { total, page, pageSize, totalPages }
  );
});
