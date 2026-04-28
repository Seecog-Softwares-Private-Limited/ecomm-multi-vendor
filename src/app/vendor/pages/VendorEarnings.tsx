"use client";

import { Download, DollarSign, TrendingDown } from "lucide-react";
import { Button, Input, Card, Select } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import * as React from "react";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function defaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultDateTo(): string {
  return new Date().toISOString().slice(0, 10);
}

export function VendorEarnings() {
  const [dateFrom, setDateFrom] = React.useState(defaultDateFrom);
  const [dateTo, setDateTo] = React.useState(defaultDateTo);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [searchOrderId, setSearchOrderId] = React.useState("");

  const paramsRef = React.useRef({
    dateFrom,
    dateTo,
    orderId: searchOrderId,
    payoutStatus: filterStatus,
  });
  paramsRef.current = {
    dateFrom,
    dateTo,
    orderId: searchOrderId,
    payoutStatus: filterStatus,
  };

  const fetcher = React.useCallback(
    () =>
      vendorService.getEarnings({
        dateFrom: paramsRef.current.dateFrom,
        dateTo: paramsRef.current.dateTo,
        orderId: paramsRef.current.orderId || undefined,
        payoutStatus:
          paramsRef.current.payoutStatus === "all"
            ? undefined
            : (paramsRef.current.payoutStatus as "paid" | "unpaid"),
      }),
    []
  );

  const { data, error, isLoading, refetch } = useApi(fetcher);
  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    refetch();
  }, [dateFrom, dateTo, searchOrderId, filterStatus, refetch]);

  const summary = data?.summary ?? { gross: 0, commission: 0, net: 0 };
  const earnings = data?.rows ?? [];

  const handleExport = () => {
    if (earnings.length === 0) {
      alert("No data to export for the selected filters.");
      return;
    }
    const headers = [
      "Order ID",
      "Date",
      "Gross Amount",
      "Commission %",
      "Commission Amt",
      "Net Earning",
      "Payout status",
      "Payout ref",
    ];
    const lines = [
      headers.map(escapeCsvCell).join(","),
      ...earnings.map((e) =>
        [
          e.orderId,
          e.orderDate,
          e.grossAmount,
          `${e.commissionPercent}`,
          e.commissionAmount,
          e.netEarning,
          e.payoutStatus,
          e.payoutRef ?? "",
        ]
          .map(escapeCsvCell)
          .join(",")
      ),
      "",
      [
        "TOTAL",
        "",
        summary.gross,
        "",
        summary.commission,
        summary.net,
        "",
        "",
      ]
        .map(escapeCsvCell)
        .join(","),
    ];
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendor-earnings-${dateFrom}_to_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DataState isLoading={isLoading} error={error} retry={refetch}>
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-bold leading-snug text-[#1E293B] sm:text-2xl lg:text-3xl">Earnings</h1>
          <p className="text-sm leading-relaxed text-[#64748B]">
            Track your revenue and commission breakdown
          </p>
        </div>
        <Button variant="primary" onClick={handleExport} className="min-h-11 w-full shrink-0 sm:w-auto">
          <Download className="h-5 w-5" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-[#64748B]">Selected range</p>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Total gross revenue</p>
          <p className="text-3xl font-bold text-[#1E293B] tabular-nums">{formatInr(summary.gross)}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-[#64748B]">Deducted</p>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Total commission</p>
          <p className="text-3xl font-bold text-[#DC2626] tabular-nums">{formatInr(summary.commission)}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-[#64748B]">Gross − commission</p>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Net earnings</p>
          <p className="text-3xl font-bold text-[#3B82F6] tabular-nums">{formatInr(summary.net)}</p>
        </Card>
      </div>

      {/* Filters — summary & export follow From / To */}
      <Card>
        <p className="text-sm text-[#64748B] mb-4">
          Choose a date range, then use <strong>Export CSV</strong> to download the same rows as in the table (UTF‑8, Excel-friendly).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="From date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Input
            label="Search Order ID"
            placeholder="#ORD-1234"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
          <Select
            label="Payout Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "unpaid", label: "Unpaid" },
              { value: "paid", label: "Paid" },
            ]}
          />
        </div>
      </Card>

      {/* Earnings Table */}
      <Card title="Earnings Breakdown">
        <div className="space-y-3 md:hidden">
          {earnings.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B]">
              No orders in this date range. Widen the dates or clear filters.
            </p>
          ) : (
            <>
              {earnings.map((earning, index) => (
                <div
                  key={`${earning.orderId}-${earning.orderDate}-${index}`}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="break-all font-bold text-[#1E293B]">{earning.orderId}</p>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                        earning.payoutStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {earning.payoutStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#64748B]">{earning.orderDate}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[#94A3B8]">Gross</p>
                      <p className="font-semibold tabular-nums text-[#1E293B]">{formatInr(earning.grossAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Commission</p>
                      <p className="font-semibold text-[#64748B]">{earning.commissionPercent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Comm. amt</p>
                      <p className="font-semibold tabular-nums text-[#DC2626]">{formatInr(earning.commissionAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Net</p>
                      <p className="font-bold tabular-nums text-[#3B82F6]">{formatInr(earning.netEarning)}</p>
                    </div>
                  </div>
                  {earning.payoutRef ? (
                    <p className="mt-2 break-all font-mono text-xs text-[#3B82F6]">{earning.payoutRef}</p>
                  ) : null}
                </div>
              ))}
              <div className="rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Totals</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[#94A3B8]">Gross</p>
                    <p className="font-bold tabular-nums text-[#1E293B]">{formatInr(summary.gross)}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Commission</p>
                    <p className="font-bold tabular-nums text-[#DC2626]">{formatInr(summary.commission)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#94A3B8]">Net</p>
                    <p className="text-lg font-bold tabular-nums text-[#3B82F6]">{formatInr(summary.net)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0]">
                <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Order ID</th>
                <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Date</th>
                <th className="px-4 py-4 text-right text-sm font-bold uppercase text-[#64748B]">Gross Amount</th>
                <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Commission</th>
                <th className="px-4 py-4 text-right text-sm font-bold uppercase text-[#64748B]">Commission Amt</th>
                <th className="px-4 py-4 text-right text-sm font-bold uppercase text-[#64748B]">Net Earning</th>
                <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Status</th>
                <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Payout Ref</th>
              </tr>
            </thead>
            <tbody>
              {earnings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#64748B]">
                    No orders in this date range. Widen the dates or clear filters.
                  </td>
                </tr>
              )}
              {earnings.map((earning, index) => (
                <tr
                  key={`${earning.orderId}-${earning.orderDate}-${index}`}
                  className="border-b border-[#E2E8F0] transition-colors hover:bg-[#F8FAFC]"
                >
                  <td className="px-4 py-4">
                    <p className="font-bold text-[#1E293B]">{earning.orderId}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-[#64748B]">{earning.orderDate}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-semibold tabular-nums text-[#1E293B]">{formatInr(earning.grossAmount)}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-semibold text-[#64748B]">{earning.commissionPercent}%</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-semibold tabular-nums text-[#DC2626]">{formatInr(earning.commissionAmount)}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-bold tabular-nums text-[#3B82F6]">{formatInr(earning.netEarning)}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-bold ${
                        earning.payoutStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {earning.payoutStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {earning.payoutRef ? (
                      <p className="font-mono text-sm text-[#3B82F6]">{earning.payoutRef}</p>
                    ) : (
                      <p className="text-sm text-[#94A3B8]">-</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-[#E2E8F0] bg-[#F8FAFC]">
              <tr>
                <td colSpan={2} className="px-4 py-4">
                  <p className="font-bold text-[#1E293B]">TOTAL</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-bold tabular-nums text-[#1E293B]">{formatInr(summary.gross)}</p>
                </td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-right">
                  <p className="font-bold tabular-nums text-[#DC2626]">{formatInr(summary.commission)}</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-bold tabular-nums text-[#3B82F6]">{formatInr(summary.net)}</p>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
    </DataState>
  );
}
