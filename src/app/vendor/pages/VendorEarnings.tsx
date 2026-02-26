"use client";

import { Calendar, Download, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Button, Input, Card, Select } from "../components/UIComponents";
import * as React from "react";

export function VendorEarnings() {
  const [dateFrom, setDateFrom] = React.useState("2026-02-01");
  const [dateTo, setDateTo] = React.useState("2026-02-25");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [searchOrderId, setSearchOrderId] = React.useState("");

  const earnings = [
    {
      orderId: "#ORD-1234",
      orderDate: "2026-02-25",
      grossAmount: 2999,
      commissionPercent: 10,
      commissionAmount: 300,
      netEarning: 2699,
      payoutStatus: "unpaid",
      payoutRef: null,
    },
    {
      orderId: "#ORD-1233",
      orderDate: "2026-02-24",
      grossAmount: 1499,
      commissionPercent: 10,
      commissionAmount: 150,
      netEarning: 1349,
      payoutStatus: "unpaid",
      payoutRef: null,
    },
    {
      orderId: "#ORD-1232",
      orderDate: "2026-02-23",
      grossAmount: 4299,
      commissionPercent: 10,
      commissionAmount: 430,
      netEarning: 3869,
      payoutStatus: "paid",
      payoutRef: "PAY-2026-02-001",
    },
    {
      orderId: "#ORD-1231",
      orderDate: "2026-02-22",
      grossAmount: 899,
      commissionPercent: 10,
      commissionAmount: 90,
      netEarning: 809,
      payoutStatus: "paid",
      payoutRef: "PAY-2026-02-001",
    },
    {
      orderId: "#ORD-1230",
      orderDate: "2026-02-21",
      grossAmount: 3499,
      commissionPercent: 10,
      commissionAmount: 350,
      netEarning: 3149,
      payoutStatus: "paid",
      payoutRef: "PAY-2026-01-003",
    },
  ];

  const filteredEarnings = earnings.filter((earning) => {
    const matchesSearch = searchOrderId
      ? earning.orderId.toLowerCase().includes(searchOrderId.toLowerCase())
      : true;
    const matchesStatus = filterStatus === "all" || earning.payoutStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totals = filteredEarnings.reduce(
    (acc, earning) => ({
      gross: acc.gross + earning.grossAmount,
      commission: acc.commission + earning.commissionAmount,
      net: acc.net + earning.netEarning,
    }),
    { gross: 0, commission: 0, net: 0 }
  );

  const handleExport = () => {
    alert("Exporting earnings report as CSV...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Earnings</h1>
          <p className="text-[#64748B]">Track your revenue and commission breakdown</p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Download className="w-5 h-5" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              +12%
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Total Gross Revenue</p>
          <p className="text-3xl font-bold text-[#1E293B]">₹{totals.gross.toLocaleString()}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-[#64748B]">10% avg</p>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Total Commission</p>
          <p className="text-3xl font-bold text-[#DC2626]">₹{totals.commission.toLocaleString()}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              +8%
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Net Earnings</p>
          <p className="text-3xl font-bold text-[#3B82F6]">₹{totals.net.toLocaleString()}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To Date"
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0]">
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Order ID
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Date
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Gross Amount
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Commission
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Commission Amt
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Net Earning
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                  Payout Ref
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEarnings.map((earning, index) => (
                <tr key={index} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-[#1E293B]">{earning.orderId}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[#64748B]">{earning.orderDate}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-[#1E293B]">₹{earning.grossAmount}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm font-semibold text-[#64748B]">
                      {earning.commissionPercent}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-[#DC2626]">₹{earning.commissionAmount}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-bold text-[#3B82F6]">₹{earning.netEarning}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        earning.payoutStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {earning.payoutStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {earning.payoutRef ? (
                      <p className="text-sm font-mono text-[#3B82F6]">{earning.payoutRef}</p>
                    ) : (
                      <p className="text-sm text-[#94A3B8]">-</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0]">
              <tr>
                <td colSpan={2} className="py-4 px-4">
                  <p className="font-bold text-[#1E293B]">TOTAL</p>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-bold text-[#1E293B]">₹{totals.gross}</p>
                </td>
                <td className="py-4 px-4"></td>
                <td className="py-4 px-4 text-right">
                  <p className="font-bold text-[#DC2626]">₹{totals.commission}</p>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-bold text-[#3B82F6]">₹{totals.net}</p>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
