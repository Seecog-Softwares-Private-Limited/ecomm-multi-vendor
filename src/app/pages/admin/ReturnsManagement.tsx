"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RotateCcw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;
const statsConfig = [
  { key: "totalReturns" as const, icon: RotateCcw, label: "Total Returns", accent: "amber" as const },
  { key: "pendingReturns" as const, icon: Clock, label: "Pending", accent: "blue" as const },
  { key: "approvedReturns" as const, icon: CheckCircle2, label: "Approved", accent: "emerald" as const },
  { key: "refundedReturns" as const, icon: CreditCard, label: "Refunded", accent: "slate" as const },
];

interface ReturnRow {
  id: string;
  orderId: string;
  seller: string;
  customer: string;
  amount: number;
  amountFormatted: string;
  reason: string;
  status: string;
  statusDisplay: string;
  date: string;
}

interface Summary {
  totalReturnsFormatted: string;
  pendingReturnsFormatted: string;
  approvedReturnsFormatted: string;
  rejectedReturnsFormatted: string;
  refundedReturnsFormatted: string;
}

const accentStyles: Record<string, { bg: string; text: string; ring: string }> = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200" },
};

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
  Refunded: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
};

export function ReturnsManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailModalReturn, setDetailModalReturn] = useState<ReturnRow | null>(null);

  const fetchReturns = useCallback(
    async (overridePage?: number) => {
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
        const res = await fetch(`/api/admin/returns?${params.toString()}`, { credentials: "include" });
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error?.message ?? "Failed to load returns");
          return;
        }
        if (json.success && json.data) {
          const d = json.data as { returns?: ReturnRow[]; summary?: Summary };
          setReturns(d.returns ?? []);
          setSummary(d.summary ?? null);
          const meta = json.meta as { total?: number; totalPages?: number } | undefined;
          setTotal(meta?.total ?? 0);
          setTotalPages(meta?.totalPages ?? 1);
        }
      } catch {
        setError("Failed to load returns");
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchReturns(1);
  };

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const getSummaryValue = (key: keyof Summary) => (summary ? summary[key] ?? "—" : "—");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Returns & Refund Management
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage return requests and process refunds
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            const style = accentStyles[stat.accent];
            const value = getSummaryValue((stat.key + "Formatted") as keyof Summary);
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 transition hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {loading && !summary ? "—" : value}
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
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

        {/* Returns table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Return ID
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Order ID
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Seller
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Refund Amount
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reason
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && returns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                      Loading returns…
                    </td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                      No returns found.
                    </td>
                  </tr>
                ) : (
                  returns.map((returnItem) => (
                    <tr key={returnItem.id} className="transition hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        #{returnItem.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        #{returnItem.orderId.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{returnItem.seller}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{returnItem.customer}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {returnItem.amountFormatted}
                      </td>
                      <td className="max-w-[180px] truncate px-6 py-4 text-sm text-slate-600" title={returnItem.reason}>
                        {returnItem.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                            statusStyles[returnItem.statusDisplay] ?? "bg-slate-50 text-slate-700 ring-slate-200"
                          }`}
                        >
                          {returnItem.statusDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{returnItem.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailModalReturn(returnItem)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          {returnItem.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 bg-white p-2 text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 bg-white p-2 text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
                <span className="font-medium text-slate-700">{endItem}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> returns
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Return Detail Modal */}
      {detailModalReturn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-detail-title"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 id="return-detail-title" className="text-lg font-semibold text-slate-900">
                Return Request Details
              </h3>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Return ID</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">#{detailModalReturn.id.slice(0, 8)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Order ID</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">#{detailModalReturn.orderId.slice(0, 8)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Seller</label>
                  <p className="mt-1 text-sm text-slate-900">{detailModalReturn.seller}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Customer</label>
                  <p className="mt-1 text-sm text-slate-900">{detailModalReturn.customer}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Refund Amount</label>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{detailModalReturn.amountFormatted}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                        statusStyles[detailModalReturn.statusDisplay] ?? "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {detailModalReturn.statusDisplay}
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Return Reason</label>
                  <p className="mt-1 text-sm text-slate-900">{detailModalReturn.reason}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setDetailModalReturn(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
              >
                Close
              </button>
              {detailModalReturn.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-emerald-600 bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Approve Refund
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-2"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
