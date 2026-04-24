import { prisma } from "@/lib/prisma";

const toNumber = (v: unknown): number =>
  typeof v === "number" ? v : Number(v) ?? 0;

/** One row in the earnings breakdown (per order, for this seller's items). */
export interface VendorEarningsRow {
  orderId: string;
  orderDate: string;
  grossAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  netEarning: number;
  payoutStatus: "paid" | "unpaid";
  payoutRef: string | null;
}

export interface VendorEarningsSummary {
  gross: number;
  commission: number;
  net: number;
}

export interface VendorEarningsResult {
  summary: VendorEarningsSummary;
  rows: VendorEarningsRow[];
}

export interface GetVendorEarningsParams {
  sellerId: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  orderIdSearch?: string;
  payoutStatus?: "all" | "paid" | "unpaid";
}

function orderDisplayId(id: string): string {
  if (id.startsWith("#")) return id;
  return `#ORD-${id.slice(-6).toUpperCase()}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Get earnings for a vendor: aggregated per order from OrderItems (this seller),
 * with payout status derived from Payout periods (paid if order date falls in a PAID payout).
 */
export async function getVendorEarnings(
  params: GetVendorEarningsParams
): Promise<VendorEarningsResult> {
  const { sellerId, dateFrom, dateTo, orderIdSearch, payoutStatus } = params;

  const orderCreatedAt: { gte?: Date; lte?: Date } = {};
  if (dateFrom) orderCreatedAt.gte = new Date(dateFrom + "T00:00:00.000Z");
  if (dateTo) orderCreatedAt.lte = new Date(dateTo + "T23:59:59.999Z");
  const hasOrderDateFilter = Boolean(dateFrom || dateTo);

  const items = await prisma.orderItem.findMany({
    where: {
      sellerId,
      ...(hasOrderDateFilter && { order: { createdAt: orderCreatedAt } }),
    },
    include: {
      order: {
        select: { id: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Paid payouts for this seller (to resolve payout status per order)
  const paidPayouts = await prisma.payout.findMany({
    where: { sellerId, status: "PAID" },
    select: { periodStart: true, periodEnd: true, reference: true },
  });

  const orderIds = new Set<string>();
  const byOrderId = new Map<
    string,
    {
      orderCreatedAt: Date;
      grossAmount: number;
      commissionAmount: number;
      netLineSum: number;
      commissionPercentSum: number;
      commissionQty: number;
    }
  >();

  for (const item of items) {
    const o = item.order;
    const gross = toNumber(item.totalPrice);
    const commAmt = toNumber(item.commissionAmount);
    const commPct = toNumber(item.commissionPercent);
    const lineNet =
      toNumber(item.netPayable) || Math.max(0, gross - commAmt);

    const existing = byOrderId.get(o.id);
    if (existing) {
      existing.grossAmount += gross;
      existing.commissionAmount += commAmt;
      existing.netLineSum += lineNet;
      existing.commissionPercentSum += commPct;
      existing.commissionQty += 1;
    } else {
      orderIds.add(o.id);
      byOrderId.set(o.id, {
        orderCreatedAt: o.createdAt,
        grossAmount: gross,
        commissionAmount: commAmt,
        netLineSum: lineNet,
        commissionPercentSum: commPct,
        commissionQty: 1,
      });
    }
  }

  const rows: VendorEarningsRow[] = [];
  for (const orderId of orderIds) {
    const row = byOrderId.get(orderId);
    if (!row) continue;

    const orderDate = row.orderCreatedAt;
    const dateStr = orderDate.toISOString().slice(0, 10);

    const displayId = orderDisplayId(orderId);
    if (orderIdSearch) {
      const q = orderIdSearch.toLowerCase().trim();
      if (
        !orderId.toLowerCase().includes(q) &&
        !displayId.toLowerCase().includes(q)
      ) {
        continue;
      }
    }

    const avgCommissionPercent =
      row.commissionQty > 0
        ? Math.round(row.commissionPercentSum / row.commissionQty)
        : 0;
    const netEarning = row.netLineSum;

    // Check if this order falls in a paid payout period
    const orderDay = new Date(orderDate);
    orderDay.setHours(0, 0, 0, 0);
    let payoutRef: string | null = null;
    for (const p of paidPayouts) {
      const start = new Date(p.periodStart);
      const end = new Date(p.periodEnd);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (orderDay >= start && orderDay <= end && p.reference) {
        payoutRef = p.reference;
        break;
      }
    }
    const payoutStatusRow: "paid" | "unpaid" = payoutRef ? "paid" : "unpaid";

    if (payoutStatus && payoutStatus !== "all" && payoutStatus !== payoutStatusRow) {
      continue;
    }

    rows.push({
      orderId: displayId,
      orderDate: dateStr,
      grossAmount: round2(row.grossAmount),
      commissionPercent: avgCommissionPercent,
      commissionAmount: round2(row.commissionAmount),
      netEarning: round2(netEarning),
      payoutStatus: payoutStatusRow,
      payoutRef,
    });
  }

  rows.sort((a, b) => b.orderDate.localeCompare(a.orderDate));

  const summary = rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.grossAmount,
      commission: acc.commission + r.commissionAmount,
      net: acc.net + r.netEarning,
    }),
    { gross: 0, commission: 0, net: 0 }
  );
  summary.gross = round2(summary.gross);
  summary.commission = round2(summary.commission);
  summary.net = round2(summary.net);

  return { summary, rows };
}
