"use client";

import { CreditCard, Calendar, Download, Info } from "lucide-react";
import { Button, Card, Alert, Input } from "../components/UIComponents";
import * as React from "react";

export function VendorPayouts() {
  const [dateFrom, setDateFrom] = React.useState("2026-01-01");
  const [dateTo, setDateTo] = React.useState("2026-02-25");

  const payouts = [
    {
      id: "PAY-2026-02-001",
      period: "Feb 16 - Feb 22, 2026",
      amount: 8827,
      status: "paid",
      paidDate: "2026-02-23",
      reference: "NEFT1234567890",
      ordersCount: 12,
    },
    {
      id: "PAY-2026-01-003",
      period: "Feb 9 - Feb 15, 2026",
      amount: 15420,
      status: "paid",
      paidDate: "2026-02-16",
      reference: "NEFT0987654321",
      ordersCount: 18,
    },
    {
      id: "PAY-2026-01-002",
      period: "Feb 2 - Feb 8, 2026",
      amount: 12350,
      status: "paid",
      paidDate: "2026-02-09",
      reference: "NEFT5678901234",
      ordersCount: 15,
    },
    {
      id: "PAY-2026-01-001",
      period: "Jan 26 - Feb 1, 2026",
      amount: 9875,
      status: "paid",
      paidDate: "2026-02-02",
      reference: "NEFT9876543210",
      ordersCount: 11,
    },
  ];

  const totalPayout = payouts.reduce((acc, payout) => acc + payout.amount, 0);
  const totalOrders = payouts.reduce((acc, payout) => acc + payout.ordersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Payouts</h1>
          <p className="text-[#64748B]">View your payout history and bank transfers</p>
        </div>
        <Button variant="primary">
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
          <p className="text-[#64748B] text-sm mb-2">Total Payouts</p>
          <p className="text-3xl font-bold text-[#1E293B]">₹{totalPayout.toLocaleString()}</p>
          <p className="text-sm text-[#64748B] mt-2">{payouts.length} transactions</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Last Payout</p>
          <p className="text-3xl font-bold text-[#3B82F6]">₹{payouts[0].amount.toLocaleString()}</p>
          <p className="text-sm text-[#64748B] mt-2">{payouts[0].paidDate}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#64748B] text-sm mb-2">Orders Paid</p>
          <p className="text-3xl font-bold text-[#1E293B]">{totalOrders}</p>
          <p className="text-sm text-[#64748B] mt-2">Across all payouts</p>
        </Card>
      </div>

      {/* Date Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="font-bold text-[#1E293B] text-lg">₹{payout.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-lg border border-green-200">
                      {payout.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[#64748B]">{payout.paidDate}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-mono text-[#64748B]">{payout.reference}</p>
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Account Holder</p>
              <p className="font-bold text-[#1E293B] text-lg">Tech Store India Pvt Ltd</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <CreditCard className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#64748B] mb-1">Account Number</p>
              <p className="font-mono text-[#1E293B] font-semibold">**** **** **** 3456</p>
            </div>
            <div>
              <p className="text-sm text-[#64748B] mb-1">IFSC Code</p>
              <p className="font-mono text-[#1E293B] font-semibold">HDFC0001234</p>
            </div>
            <div>
              <p className="text-sm text-[#64748B] mb-1">Bank Name</p>
              <p className="text-[#1E293B] font-semibold">HDFC Bank</p>
            </div>
            <div>
              <p className="text-sm text-[#64748B] mb-1">Branch</p>
              <p className="text-[#1E293B] font-semibold">MG Road, Bangalore</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-[#64748B]">
            <Info className="w-4 h-4" />
            <span>To update bank details, visit Profile & KYC section</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
