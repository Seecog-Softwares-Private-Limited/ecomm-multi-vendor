"use client";

import { FileText, Download, Calendar, Package, ShoppingBag, DollarSign } from "lucide-react";
import { Button, Card, Input, Alert } from "../components/UIComponents";
import * as React from "react";

export function VendorReports() {
  const [ordersDateFrom, setOrdersDateFrom] = React.useState("2026-02-01");
  const [ordersDateTo, setOrdersDateTo] = React.useState("2026-02-25");
  const [productsDateFrom, setProductsDateFrom] = React.useState("2026-02-01");
  const [productsDateTo, setProductsDateTo] = React.useState("2026-02-25");
  const [earningsDateFrom, setEarningsDateFrom] = React.useState("2026-02-01");
  const [earningsDateTo, setEarningsDateTo] = React.useState("2026-02-25");

  const handleDownloadOrders = () => {
    alert(`Downloading Orders Report (${ordersDateFrom} to ${ordersDateTo})`);
  };

  const handleDownloadProducts = () => {
    alert(`Downloading Products Report (${productsDateFrom} to ${productsDateTo})`);
  };

  const handleDownloadEarnings = () => {
    alert(`Downloading Earnings Report (${earningsDateFrom} to ${earningsDateTo})`);
  };

  const reportStats = [
    {
      label: "Orders This Month",
      value: "127",
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Products Listed",
      value: "45",
      icon: Package,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Total Earnings",
      value: "₹42,350",
      icon: DollarSign,
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Reports</h1>
        <p className="text-[#64748B]">Download detailed reports for your business records</p>
      </div>

      {/* Info Alert */}
      <Alert
        type="info"
        message="Reports are generated in CSV format with standardized columns. You can import them into Excel, Google Sheets, or any accounting software."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[#64748B] text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-[#1E293B]">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Orders Report */}
      <Card
        title="Orders Report"
        actions={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">CSV Format</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[#64748B]">
            Download a complete list of all orders with customer details, items, payment status, and order timeline.
          </p>

          <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
            <h4 className="font-semibold text-[#1E293B] mb-3">Report includes:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#64748B]">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Order ID & Date
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Customer Name & Contact
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Order Items & Quantities
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Order Amount & Payment Mode
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Order Status & Timeline
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Delivery Address
              </li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="From Date"
                type="date"
                value={ordersDateFrom}
                onChange={(e) => setOrdersDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="To Date"
                type="date"
                value={ordersDateTo}
                onChange={(e) => setOrdersDateTo(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleDownloadOrders}>
              <Download className="w-5 h-5" />
              Download CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Report */}
      <Card
        title="Products Report"
        actions={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">CSV Format</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[#64748B]">
            Download a complete catalog of your products including pricing, inventory, and approval status.
          </p>

          <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
            <h4 className="font-semibold text-[#1E293B] mb-3">Report includes:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#64748B]">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Product Name & SKU
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Category & Sub-Category
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                MRP & Selling Price
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                GST Percentage
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Stock Quantity
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Approval Status
              </li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="From Date"
                type="date"
                value={productsDateFrom}
                onChange={(e) => setProductsDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="To Date"
                type="date"
                value={productsDateTo}
                onChange={(e) => setProductsDateTo(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleDownloadProducts}>
              <Download className="w-5 h-5" />
              Download CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Earnings Report */}
      <Card
        title="Earnings Report"
        actions={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">CSV Format</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[#64748B]">
            Download detailed earnings breakdown with commission calculations and payout information.
          </p>

          <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
            <h4 className="font-semibold text-[#1E293B] mb-3">Report includes:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#64748B]">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Order ID & Date
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Gross Amount
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Commission Percentage
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Commission Amount
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Net Earnings
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                Payout Status & Reference
              </li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="From Date"
                type="date"
                value={earningsDateFrom}
                onChange={(e) => setEarningsDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="To Date"
                type="date"
                value={earningsDateTo}
                onChange={(e) => setEarningsDateTo(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleDownloadEarnings}>
              <Download className="w-5 h-5" />
              Download CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card title="Need Help?">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1E293B] mb-2">How to use reports?</h4>
            <p className="text-sm text-[#64748B] mb-4">
              All reports are downloaded in CSV (Comma Separated Values) format. You can open them with Excel,
              Google Sheets, or import them into accounting software like Tally, QuickBooks, or Zoho Books.
            </p>
            <p className="text-sm text-[#64748B]">
              For custom reports or bulk data exports, please contact our support team.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
