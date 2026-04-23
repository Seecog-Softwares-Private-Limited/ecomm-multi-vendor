"use client";

import { CreditCard, Calendar, Download, Info } from "lucide-react";
import { Button, Card, Alert, Input } from "../components/UIComponents";
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

function defaultPayoutDateFrom(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultPayoutDateTo(): string {
  return new Date().toISOString().slice(0, 10);
}

export function VendorPayouts() {
  const [dateFrom, setDateFrom] = React.useState(defaultPayoutDateFrom);
  const [dateTo, setDateTo] = React.useState(defaultPayoutDateTo);

  const paramsRef = React.useRef({ dateFrom, dateTo });
  paramsRef.current = { dateFrom, dateTo };
  const fetcher = React.useCallback(
    () =>
      vendorService.getPayouts({
        dateFrom: paramsRef.current.dateFrom,
        dateTo: paramsRef.current.dateTo,
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
  }, [dateFrom, dateTo, refetch]);

  const summary = data?.summary ?? {
    totalPayouts: 0,
    transactionCount: 0,
    lastPayoutAmount: null,
    lastPayoutDate: null,
    ordersPaid: 0,
  };
  const payouts = data?.payouts ?? [];
  const bankAccount = data?.bankAccount ?? null;

  const handleExport = () => {
    if (payouts.length === 0) {
      alert("No payouts in the selected period.");
      return;
    }
    const headers = [
      "Payout ID",
      "Period",
      "Orders",
      "Amount",
      "Status",
      "Paid date",
      "Reference",
    ];
    const lines = [
      headers.map(escapeCsvCell).join(","),
      ...payouts.map((p) =>
        [
          p.id,
          p.period,
          p.ordersCount,
          p.amount,
          p.status,
          p.paidDate ?? "",
          p.reference ?? "",
        ]
          .map(escapeCsvCell)
          .join(",")
      ),
    ];
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendor-payouts-${dateFrom}_to_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DataState isLoading={isLoading} error={error} retry={refetch}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Payouts</h1>
          <p className="text-[#64748B]">View your payout history and bank transfers</p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Download className="w-5 h-5" />
          Export Report
        </Button>
      </div>

      {/* Info Alerts */}
      <div className="space-y-4">
        <Alert
          type="info"
          title="Payout Schedule"
          message="Payouts are processed weekly (every Friday) for orders delivered in the previous week. Funds are transferred to your registered bank account within 2-3 business days."
        />
        <Alert
          type="warning"
          title="Bank Account Changes"
          message="To update your bank account details, please visit Profile & KYC section. Bank changes require admin approval and may take 2-3 days."
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Total paid (selected range)</p>
          <p className="text-3xl font-bold text-[#1E293B] tabular-nums">{formatInr(summary.totalPayouts)}</p>
          <p className="text-sm text-[#64748B] mt-2">
            {summary.transactionCount} payout run{summary.transactionCount === 1 ? "" : "s"} in range
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Most recent completed payout</p>
          <p className="text-3xl font-bold text-[#3B82F6] tabular-nums">
            {summary.lastPayoutAmount != null ? formatInr(summary.lastPayoutAmount) : "—"}
          </p>
          <p className="text-sm text-[#64748B] mt-2">{summary.lastPayoutDate ?? "—"}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Orders paid (in paid payouts)</p>
          <p className="text-3xl font-bold text-[#1E293B] tabular-nums">{summary.ordersPaid}</p>
          <p className="text-sm text-[#64748B] mt-2">From completed payouts in this filter</p>
        </Card>
      </div>

      {/* Date filter: payout *period* overlaps this window */}
      <Card>
        <p className="text-sm text-[#64748B] mb-4">
          Show payout batches whose <strong>statement period</strong> overlaps the dates below. Use{" "}
          <strong>Export report</strong> to download the table as CSV.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </Card>

      {/* Payouts Table */}
      <Card title="Payout History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0]">
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Payout ID
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Period
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Orders
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Amount
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Paid Date
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B] text-sm">
                    No payout batches in this date range. Try a wider range.
                  </td>
                </tr>
              )}
              {payouts.map((payout) => (
                <tr
                  key={payout.id}
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="font-bold text-[#3B82F6]">{payout.id}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[#64748B]">{payout.period}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                      {payout.ordersCount} orders
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-bold text-[#1E293B] text-lg tabular-nums">{formatInr(payout.amount)}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${
                        payout.status === "paid"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : payout.status === "failed"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {payout.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[#64748B]">{payout.paidDate ?? "—"}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-mono text-[#64748B]">{payout.reference ?? "—"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bank Details Card */}
      <Card title="Registered Bank Account">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
          {bankAccount ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Account Holder</p>
                  <p className="font-bold text-[#1E293B] text-lg">{bankAccount.accountHolderName}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <CreditCard className="w-6 h-6 text-[#3B82F6]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Account Number</p>
                  <p className="font-mono text-[#1E293B] font-semibold">{bankAccount.accountNumberMasked}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">IFSC Code</p>
                  <p className="font-mono text-[#1E293B] font-semibold">{bankAccount.ifscCode}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Bank Name</p>
                  <p className="text-[#1E293B] font-semibold">{bankAccount.bankName}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-[#64748B]">
                <Info className="w-4 h-4" />
                <span>To update bank details, visit Profile & KYC section</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-[#64748B]">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p>No bank account registered. Add one in Profile & KYC to receive payouts.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
    </DataState>
  );
}
