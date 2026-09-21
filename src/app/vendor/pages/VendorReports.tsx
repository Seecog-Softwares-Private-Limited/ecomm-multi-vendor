"use client";

import { FileText, Download, Package, ShoppingBag, DollarSign } from "lucide-react";
import { Button, Card, Input, Alert } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { Link } from "../../components/Link";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import { getStartOfCurrentMonthIsoDate } from "@/lib/vendor/date-ranges";
import { downloadCsvFile, escapeCsvCell } from "@/lib/download-csv";
import * as React from "react";

function orderDisplayId(id: string): string {
  if (id.startsWith("#")) return id;
  return `#ORD-${id.slice(-6).toUpperCase()}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function VendorReports() {
  const [ordersDateFrom, setOrdersDateFrom] = React.useState(getStartOfCurrentMonthIsoDate);
  const [ordersDateTo, setOrdersDateTo] = React.useState(todayIsoDate);
  const [productsDateFrom, setProductsDateFrom] = React.useState(getStartOfCurrentMonthIsoDate);
  const [productsDateTo, setProductsDateTo] = React.useState(todayIsoDate);
  const [earningsDateFrom, setEarningsDateFrom] = React.useState(getStartOfCurrentMonthIsoDate);
  const [earningsDateTo, setEarningsDateTo] = React.useState(todayIsoDate);
  const [downloading, setDownloading] = React.useState<"orders" | "products" | "earnings" | null>(null);

  const { data: summary, error, isLoading, refetch } = useApi(() =>
    vendorService.getReportsSummary()
  );

  const handleDownloadOrders = async () => {
    setDownloading("orders");
    try {
      const orders = await vendorService.getOrders({
        dateFrom: ordersDateFrom,
        dateTo: ordersDateTo,
      });
      if (orders.length === 0) {
        alert("No orders found for the selected date range.");
        return;
      }
      const headers = [
        "Order ID",
        "Date",
        "Customer",
        "Phone",
        "Items",
        "Amount (₹)",
        "Payment Mode",
        "Status",
      ];
      const lines = [
        headers.map(escapeCsvCell).join(","),
        ...orders.map((o) =>
          [
            orderDisplayId(o.id),
            o.date,
            o.customer,
            o.phone,
            o.itemsCount,
            o.amount,
            o.paymentMode,
            o.status,
          ]
            .map(escapeCsvCell)
            .join(",")
        ),
      ];
      downloadCsvFile(
        `orders-report-${ordersDateFrom}-${ordersDateTo}.csv`,
        lines.join("\n")
      );
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to download orders report");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadProducts = async () => {
    setDownloading("products");
    try {
      const products = await vendorService.getProducts({
        dateFrom: productsDateFrom,
        dateTo: productsDateTo,
      });
      if (products.length === 0) {
        alert("No products found for the selected date range.");
        return;
      }
      const headers = [
        "Product Name",
        "SKU",
        "Category",
        "Price (₹)",
        "Stock",
        "Status",
        "Last Updated",
      ];
      const lines = [
        headers.map(escapeCsvCell).join(","),
        ...products.map((p) =>
          [p.name, p.sku, p.category, p.price, p.stock, p.status, p.lastUpdated]
            .map(escapeCsvCell)
            .join(",")
        ),
      ];
      downloadCsvFile(
        `products-report-${productsDateFrom}-${productsDateTo}.csv`,
        lines.join("\n")
      );
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to download products report");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadEarnings = async () => {
    setDownloading("earnings");
    try {
      const { rows } = await vendorService.getEarnings({
        dateFrom: earningsDateFrom,
        dateTo: earningsDateTo,
      });
      if (rows.length === 0) {
        alert("No earnings found for the selected date range.");
        return;
      }
      const headers = [
        "Order ID",
        "Date",
        "Gross Amount (₹)",
        "Commission %",
        "Commission Amt (₹)",
        "Net Earning (₹)",
        "Payout Status",
        "Payout Ref",
      ];
      const lines = [
        headers.map(escapeCsvCell).join(","),
        ...rows.map((r) =>
          [
            r.orderId,
            r.orderDate,
            r.grossAmount,
            r.commissionPercent,
            r.commissionAmount,
            r.netEarning,
            r.payoutStatus,
            r.payoutRef ?? "",
          ]
            .map(escapeCsvCell)
            .join(",")
        ),
      ];
      downloadCsvFile(
        `earnings-report-${earningsDateFrom}-${earningsDateTo}.csv`,
        lines.join("\n")
      );
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to download earnings report");
    } finally {
      setDownloading(null);
    }
  };

  const ordersThisMonthHref = `/vendor/orders?period=this-month&dateFrom=${getStartOfCurrentMonthIsoDate()}`;

  const reportStats = [
    {
      label: "Orders This Month",
      value: summary ? String(summary.ordersThisMonth) : "—",
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-600",
      href: ordersThisMonthHref,
    },
    {
      label: "Products Listed",
      value: summary ? String(summary.productsListed) : "—",
      icon: Package,
      color: "from-green-500 to-emerald-600",
      href: "/vendor/products?status=approved",
    },
    {
      label: "Total Earnings",
      value: summary != null ? `₹${summary.totalEarnings.toLocaleString()}` : "—",
      icon: DollarSign,
      color: "from-purple-500 to-pink-600",
      href: "/vendor/earnings",
    },
  ];

  return (
    <DataState isLoading={isLoading} error={error} retry={refetch}>
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold leading-snug text-[#1E293B] sm:text-2xl lg:text-3xl">Reports</h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          Download detailed reports for your business records
        </p>
      </div>

      {/* Info Alert */}
      <Alert
        type="info"
        message="Reports are generated in CSV format with standardized columns. You can import them into Excel, Google Sheets, or any accounting software."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {reportStats.map((stat, index) => {
          const Icon = stat.icon;
          const statCard = (
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
          if (stat.href) {
            return (
              <Link
                key={index}
                href={stat.href}
                className="block rounded-2xl transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
              >
                {statCard}
              </Link>
            );
          }
          return statCard;
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

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
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
            <Button
              variant="primary"
              className="min-h-11 w-full shrink-0 md:w-auto"
              onClick={handleDownloadOrders}
              disabled={downloading !== null}
            >
              <Download className="h-5 w-5" />
              {downloading === "orders" ? "Downloading…" : "Download CSV"}
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

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
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
            <Button
              variant="primary"
              className="min-h-11 w-full shrink-0 md:w-auto"
              onClick={handleDownloadProducts}
              disabled={downloading !== null}
            >
              <Download className="h-5 w-5" />
              {downloading === "products" ? "Downloading…" : "Download CSV"}
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

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
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
            <Button
              variant="primary"
              className="min-h-11 w-full shrink-0 md:w-auto"
              onClick={handleDownloadEarnings}
              disabled={downloading !== null}
            >
              <Download className="h-5 w-5" />
              {downloading === "earnings" ? "Downloading…" : "Download CSV"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card title="Need Help?">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <FileText className="h-6 w-6 text-blue-600" />
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
    </DataState>
  );
}
