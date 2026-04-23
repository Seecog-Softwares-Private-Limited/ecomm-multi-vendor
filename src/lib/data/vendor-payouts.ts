import type { Prisma } from "@prisma/client";
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
  const where: Prisma.PayoutWhereInput = { sellerId };

  // Payouts whose statement period overlaps the selected [dateFrom, dateTo] window
  if (dateFrom || dateTo) {
    const from = dateFrom
      ? new Date(dateFrom + "T00:00:00.000Z")
      : new Date(0);
    const to = dateTo
      ? new Date(dateTo + "T23:59:59.999Z")
      : new Date(8640000000000000);
    where.AND = [{ periodStart: { lte: to } }, { periodEnd: { gte: from } }];
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

  const paidOnly = payouts.filter((p) => p.status === "paid");
  const totalPayouts = paidOnly.reduce((sum, p) => sum + p.amount, 0);
  const ordersPaid = paidOnly.reduce((sum, p) => sum + p.ordersCount, 0);
  const last =
    paidOnly
      .slice()
      .sort((a, b) => {
        const ta = a.paidDate ? new Date(a.paidDate + "T12:00:00").getTime() : 0;
        const tb = b.paidDate ? new Date(b.paidDate + "T12:00:00").getTime() : 0;
        return tb - ta;
      })[0] ?? null;

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
