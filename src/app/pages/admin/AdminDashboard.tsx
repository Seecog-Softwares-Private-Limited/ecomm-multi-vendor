"use client";

import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  FileCheck,
  RotateCcw,
} from "lucide-react";

const statsCards = [
  {
    icon: DollarSign,
    label: "GMV",
    value: "$2,450,000",
    change: "+12.5%",
    trend: "up",
    accent: "indigo",
  },
  {
    icon: ShoppingBag,
    label: "Total Orders",
    value: "15,248",
    change: "+8.2%",
    trend: "up",
    accent: "emerald",
  },
  {
    icon: Users,
    label: "Total Sellers",
    value: "1,234",
    change: "+15.3%",
    trend: "up",
    accent: "violet",
  },
  {
    icon: TrendingUp,
    label: "Revenue",
    value: "$245,000",
    change: "+10.8%",
    trend: "up",
    accent: "amber",
  },
  {
    icon: FileCheck,
    label: "Pending KYC",
    value: "23",
    change: "-5.2%",
    trend: "down",
    accent: "sky",
  },
  {
    icon: RotateCcw,
    label: "Pending Returns",
    value: "47",
    change: "+2.1%",
    trend: "up",
    accent: "rose",
  },
];

const accentStyles: Record<string, string> = {
  indigo:
    "bg-indigo-500/10 text-indigo-600 ring-indigo-500/20",
  emerald:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  violet:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20",
  amber:
    "bg-amber-500/10 text-amber-600 ring-amber-500/20",
  sky: "bg-sky-500/10 text-sky-600 ring-sky-500/20",
  rose: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
};

const recentOrders = [
  {
    id: "#ORD-12345",
    customer: "John Doe",
    seller: "Tech Store",
    amount: "$299.99",
    status: "Delivered",
    date: "2026-02-18",
  },
  {
    id: "#ORD-12344",
    customer: "Jane Smith",
    seller: "Fashion Hub",
    amount: "$149.99",
    status: "Shipped",
    date: "2026-02-18",
  },
  {
    id: "#ORD-12343",
    customer: "Bob Johnson",
    seller: "Home Decor",
    amount: "$89.99",
    status: "Processing",
    date: "2026-02-17",
  },
  {
    id: "#ORD-12342",
    customer: "Alice Brown",
    seller: "Sports Gear",
    amount: "$199.99",
    status: "Pending",
    date: "2026-02-17",
  },
  {
    id: "#ORD-12341",
    customer: "Charlie Wilson",
    seller: "Electronics Plus",
    amount: "$449.99",
    status: "Delivered",
    date: "2026-02-16",
  },
];

function statusBadgeClass(status: string): string {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status.toLowerCase()) {
    case "delivered":
      return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
    case "shipped":
      return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-600/20`;
    case "processing":
      return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`;
    case "pending":
      return `${base} bg-slate-100 text-slate-700 ring-1 ring-slate-300/50`;
    default:
      return `${base} bg-slate-100 text-slate-600`;
  }
}

export function AdminDashboard() {
  return (
    <div className="min-h-full bg-slate-50/80 p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const accent = accentStyles[stat.accent] ?? accentStyles.indigo;
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      stat.trend === "up" ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Revenue Overview
          </h3>
          <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">Line chart</p>
              <p className="mt-0.5 text-xs text-slate-400">Revenue trend</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Orders Overview
          </h3>
          <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">Bar chart</p>
              <p className="mt-0.5 text-xs text-slate-400">Orders trend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-200/80 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Order ID
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Seller
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {order.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                    {order.customer}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {order.seller}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                    {order.amount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={statusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
