"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Filter, Eye, DollarSign, ShoppingBag, TrendingUp, Package, Loader2 } from "lucide-react";
import { DatePickerPopover } from "@/app/components/ui/date-picker-popover";

const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PLACED", label: "Pending" },
  { value: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

type OrderRow = {
  id: string;
  orderId: string;
  customer: string;
  seller: string;
  amount: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
};

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
};

function formatRevenue(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n);
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(json?.error?.message ?? "Failed to load orders");
        return;
      }
      const data = json.data;
      setOrders(data.orders ?? []);
      setStats(data.stats ?? { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 });
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchOrders();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const statCards = [
    { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders.toLocaleString(), accent: "from-slate-500 to-slate-600", iconBg: "bg-slate-500/10 text-slate-600" },
    { icon: DollarSign, label: "Total Revenue", value: formatRevenue(stats.totalRevenue), accent: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500/10 text-emerald-600" },
    { icon: Package, label: "Pending Orders", value: stats.pendingOrders.toLocaleString(), accent: "from-amber-500 to-orange-500", iconBg: "bg-amber-500/10 text-amber-600" },
    { icon: TrendingUp, label: "Completed Orders", value: stats.completedOrders.toLocaleString(), accent: "from-indigo-500 to-violet-500", iconBg: "bg-indigo-500/10 text-indigo-600" },
  ];

  const orderStatusBadge = (s: string) => {
    if (s === "Delivered") return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
    if (s === "Shipped" || s === "Out for Delivery") return "bg-sky-500/10 text-sky-700 border border-sky-500/20";
    if (s === "Processing" || s === "Payment Confirmed") return "bg-amber-500/10 text-amber-700 border border-amber-500/20";
    if (s === "Cancelled" || s === "Returned") return "bg-rose-500/10 text-rose-700 border border-rose-500/20";
    return "bg-slate-100 text-slate-700 border border-slate-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Orders Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all orders across the marketplace
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 transition hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`} aria-hidden />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {loading ? "—" : stat.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}>
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-medium text-slate-700">Filter orders</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <DatePickerPopover
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="From date"
              className="min-w-[160px]"
            />
            <DatePickerPopover
              value={dateTo}
              onChange={setDateTo}
              placeholder="To date"
              className="min-w-[160px]"
            />
            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                <p className="text-sm font-medium text-slate-500">Loading orders…</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Seller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Order Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <p className="text-sm font-medium text-slate-500">No orders found</p>
                        <p className="mt-1 text-xs text-slate-400">Try adjusting filters or date range</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                          {order.orderId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{order.customer}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{order.seller}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatAmount(order.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                              order.paymentStatus === "Paid"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${orderStatusBadge(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {order.date}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium text-slate-900">{start}</span> to{" "}
              <span className="font-medium text-slate-900">{end}</span> of{" "}
              <span className="font-medium text-slate-900">{total.toLocaleString()}</span> orders
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : Math.max(1, page - 2 + i);
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                      page === p
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
