"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, DollarSign, TrendingUp, Clock, CheckCircle, FileText } from "lucide-react";

const PAGE_SIZE = 10;
const statsConfig = [
  { key: "totalCommission" as const, icon: DollarSign, label: "Total Commission", accent: "amber" as const },
  { key: "totalPayout" as const, icon: TrendingUp, label: "Total Payouts", accent: "emerald" as const },
  { key: "pendingAmount" as const, icon: Clock, label: "Pending Settlements", accent: "blue" as const },
  { key: "completedThisMonth" as const, icon: CheckCircle, label: "Completed This Month", accent: "slate" as const },
];

type SettlementStatusApi = "PENDING" | "PROCESSING" | "COMPLETED";
type SettlementStatusDisplay = "Pending" | "Processing" | "Completed";

interface SettlementRow {
  id: string;
  seller: string;
  revenue: number;
  commission: number;
  payout: number;
  status: SettlementStatusApi;
  date: string;
}

interface Summary {
  totalCommissionFormatted: string;
  totalPayoutFormatted: string;
  pendingFormatted: string;
  completedThisMonthFormatted: string;
}

const accentStyles: Record<string, { bg: string; text: string; ring: string }> = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200" },
};

const statusStyles: Record<SettlementStatusDisplay, string> = {
  Pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Processing: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  Completed: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
};

function statusToDisplay(s: SettlementStatusApi): SettlementStatusDisplay {
  return s === "PENDING" ? "Pending" : s === "PROCESSING" ? "Processing" : "Completed";
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

export function SettlementDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchSettlements = useCallback(async (overridePage?: number) => {
    setLoading(true);
    setError(null);
    const currentPage = overridePage ?? page;
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("pageSize", String(PAGE_SIZE));
    if (statusFilter) params.set("status", statusFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    try {
      const res = await fetch(`/api/admin/settlements?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Failed to load settlements");
        return;
      }
      if (json.success && json.data) {
        const d = json.data as {
          summary?: Record<string, number>;
          totalCommissionFormatted?: string;
          totalPayoutFormatted?: string;
          pendingFormatted?: string;
          completedThisMonthFormatted?: string;
          settlements?: SettlementRow[];
        };
        setSummary({
          totalCommissionFormatted: d.totalCommissionFormatted ?? "$0",
          totalPayoutFormatted: d.totalPayoutFormatted ?? "$0",
          pendingFormatted: d.pendingFormatted ?? "$0",
          completedThisMonthFormatted: d.completedThisMonthFormatted ?? "$0",
        });
        setSettlements(d.settlements ?? []);
        const meta = json.meta as { total?: number; totalPages?: number } | undefined;
        setTotal(meta?.total ?? 0);
        setTotalPages(meta?.totalPages ?? 1);
      }
    } catch {
      setError("Failed to load settlements");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchSettlements(1);
  };

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Settlement Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Track commission and seller payouts
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            const style = accentStyles[stat.accent];
            const value =
              summary &&
              (stat.key === "totalCommission"
                ? summary.totalCommissionFormatted
                : stat.key === "totalPayout"
                  ? summary.totalPayoutFormatted
                  : stat.key === "pendingAmount"
                    ? summary.pendingFormatted
                    : summary.completedThisMonthFormatted);
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 transition hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {loading && !summary ? "—" : value ?? "—"}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${style.bg} ${style.text} ${style.ring}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="rounded-xl border border-amber-600 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Settlements table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Seller Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Commission (10%)
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payout Amount
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Settlement Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      Loading settlements…
                    </td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      No settlements found.
                    </td>
                  </tr>
                ) : (
                  settlements.map((settlement) => {
                    const statusDisplay = statusToDisplay(settlement.status);
                    return (
                      <tr key={settlement.id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {settlement.seller}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatMoney(settlement.revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatMoney(settlement.commission)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatMoney(settlement.payout)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              statusStyles[statusDisplay] ?? "bg-slate-100 text-slate-700 ring-slate-200"
                            }`}
                          >
                            {statusDisplay}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {settlement.date}
                        </td>
                        <td className="px-6 py-4">
                          {settlement.status === "PENDING" && (
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
                            >
                              Process
                            </button>
                          )}
                          {settlement.status === "COMPLETED" && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary footer + pagination */}
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
                <span className="font-medium text-slate-700">{endItem}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> settlements
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Total Commission</p>
                <p className="text-lg font-semibold text-slate-900">
                  {summary?.totalCommissionFormatted ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Total Payout</p>
                <p className="text-lg font-semibold text-slate-900">
                  {summary?.totalPayoutFormatted ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
