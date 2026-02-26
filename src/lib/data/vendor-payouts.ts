import { prisma } from "@/lib/prisma";

const toNumber = (v: unknown): number =>
  typeof v === "number" ? v : Number(v) ?? 0;

export interface VendorPayoutListItem {
  id: string;
  period: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  paidDate: string | null;
  reference: string | null;
  ordersCount: number;
}

export interface VendorPayoutsSummary {
  totalPayouts: number;
  transactionCount: number;
  lastPayoutAmount: number | null;
  lastPayoutDate: string | null;
  ordersPaid: number;
}

export interface VendorBankAccount {
  accountHolderName: string;
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
}

export interface VendorPayoutsResult {
  summary: VendorPayoutsSummary;
  payouts: VendorPayoutListItem[];
  bankAccount: VendorBankAccount | null;
}

function formatPayoutDisplayId(id: string, periodStart: Date): string {
  const y = periodStart.getFullYear();
  const m = String(periodStart.getMonth() + 1).padStart(2, "0");
  const suffix = id.slice(-4).toUpperCase();
  return `PAY-${y}-${m}-${suffix}`;
}

function formatPeriod(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

function maskAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\s/g, "");
  if (cleaned.length < 4) return "****";
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Get payouts and summary for a vendor, optionally filtered by date range.
 * Also returns primary bank account (masked) for display.
 */
export async function getVendorPayouts(
  sellerId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<VendorPayoutsResult> {
  const where: {
    sellerId: string;
    periodEnd?: { gte?: Date; lte?: Date };
  } = { sellerId };

  if (dateFrom || dateTo) {
    const filterDate: { gte?: Date; lte?: Date } = {};
    if (dateFrom) filterDate.gte = new Date(dateFrom + "T00:00:00.000Z");
    if (dateTo) filterDate.lte = new Date(dateTo + "T23:59:59.999Z");
    where.periodEnd = filterDate;
  }

  const payoutsDb = await prisma.payout.findMany({
    where,
    orderBy: { periodEnd: "desc" },
  });

  const payouts: VendorPayoutListItem[] = payoutsDb.map((p) => {
    const periodStart = new Date(p.periodStart);
    const periodEnd = new Date(p.periodEnd);
    const status =
      p.status === "PAID" ? "paid" : p.status === "FAILED" ? "failed" : "pending";
    return {
      id: formatPayoutDisplayId(p.id, periodStart),
      period: formatPeriod(periodStart, periodEnd),
      amount: toNumber(p.amount),
      status,
      paidDate: p.paidAt ? p.paidAt.toISOString().slice(0, 10) : null,
      reference: p.reference,
      ordersCount: p.ordersCount ?? 0,
    };
  });

  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  const ordersPaid = payouts.reduce((sum, p) => sum + p.ordersCount, 0);
  const last = payouts[0] ?? null;

  const summary: VendorPayoutsSummary = {
    totalPayouts,
    transactionCount: payouts.length,
    lastPayoutAmount: last?.amount ?? null,
    lastPayoutDate: last?.paidDate ?? null,
    ordersPaid,
  };

  const bank = await prisma.bankAccount.findFirst({
    where: { sellerId, deletedAt: null, isPrimary: true },
    select: {
      accountHolderName: true,
      accountNumber: true,
      ifscCode: true,
      bankName: true,
    },
  });

  const bankAccount: VendorBankAccount | null = bank
    ? {
        accountHolderName: bank.accountHolderName,
        accountNumberMasked: maskAccountNumber(bank.accountNumber),
        ifscCode: bank.ifscCode,
        bankName: bank.bankName,
      }
    : null;

  return { summary, payouts, bankAccount };
}
