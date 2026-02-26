import { prisma } from "@/lib/prisma";

const toNumber = (v: unknown): number =>
  typeof v === "number" ? v : Number(v) ?? 0;

export interface VendorReportsSummary {
  ordersThisMonth: number;
  productsListed: number;
  totalEarnings: number;
}

/**
 * Get summary stats for the reports dashboard: orders this month (distinct orders
 * containing this seller's items), total products listed, total earnings (sum of
 * net from this seller's order items, all time or this month).
 * "Total Earnings" here is all-time net earnings for consistency with earnings page.
 */
export async function getVendorReportsSummary(
  sellerId: string
): Promise<VendorReportsSummary> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ordersThisMonth, productsListed, earningsRows] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["orderId"],
      where: {
        sellerId,
        order: { createdAt: { gte: startOfMonth } },
      },
    }).then((groups) => groups.length),

    prisma.product.count({
      where: { sellerId, deletedAt: null },
    }),

    prisma.orderItem.findMany({
      where: { sellerId },
      select: {
        totalPrice: true,
        commissionAmount: true,
        netPayable: true,
      },
    }),
  ]);

  const totalEarnings = earningsRows.reduce((sum, row) => {
    const net = toNumber(row.netPayable);
    const fallback = toNumber(row.totalPrice) - toNumber(row.commissionAmount);
    return sum + (net || fallback);
  }, 0);

  return {
    ordersThisMonth,
    productsListed,
    totalEarnings,
  };
}
