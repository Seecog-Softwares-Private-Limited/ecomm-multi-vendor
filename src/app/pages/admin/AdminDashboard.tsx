"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  FileCheck,
  RotateCcw,
} from "lucide-react";

interface DashboardStats {
  gmvFormatted: string;
  gmvChange: string | null;
  totalOrdersFormatted: string;
  totalOrdersChange: string | null;
  totalSellersFormatted: string;
  totalSellersChange: string | null;
  revenueFormatted: string;
  revenueChange: string | null;
  pendingKycFormatted: string;
  pendingKycChange: string | null;
  pendingReturnsFormatted: string;
  pendingReturnsChange: string | null;
}

interface RecentOrder {
  id: string;
  customer: string;
  seller: string;
  amountFormatted: string;
  status: string;
  date: string;
}

interface DashboardChartPoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  revenueFormatted: string;
}

const statsConfig = [
  {
    key: "gmv" as const,
    icon: DollarSign,
    label: "GMV",
    valueKey: "gmvFormatted" as const,
    changeKey: "gmvChange" as const,
    accent: "indigo",
    href: "/admin/analytics",
  },
  {
    key: "orders" as const,
    icon: ShoppingBag,
    label: "Total Orders",
    valueKey: "totalOrdersFormatted" as const,
    changeKey: "totalOrdersChange" as const,
    accent: "emerald",
    href: "/admin/orders",
  },
  {
    key: "sellers" as const,
    icon: Users,
    label: "Total Sellers",
    valueKey: "totalSellersFormatted" as const,
    changeKey: "totalSellersChange" as const,
    accent: "violet",
    href: "/admin/sellers",
  },
  {
    key: "revenue" as const,
    icon: TrendingUp,
    label: "Revenue",
    valueKey: "revenueFormatted" as const,
    changeKey: "revenueChange" as const,
    accent: "amber",
    href: "/admin/analytics",
  },
  {
    key: "kyc" as const,
    icon: FileCheck,
    label: "Pending KYC",
    valueKey: "pendingKycFormatted" as const,
    changeKey: "pendingKycChange" as const,
    accent: "sky",
    href: "/admin/sellers",
  },
  {
    key: "returns" as const,
    icon: RotateCcw,
    label: "Pending Returns",
    valueKey: "pendingReturnsFormatted" as const,
    changeKey: "pendingReturnsChange" as const,
    accent: "rose",
    href: "/admin/returns",
  },
];

const accentStyles: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-600 ring-indigo-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  violet: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
  amber: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
  sky: "bg-sky-500/10 text-sky-600 ring-sky-500/20",
  rose: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
};

function statusBadgeClass(status: string): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const s = status.toLowerCase();
  if (s === "delivered") return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
  if (s === "shipped") return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-600/20`;
  if (s === "processing" || s === "payment confirmed") return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`;
  if (s === "placed" || s === "pending") return `${base} bg-slate-100 text-slate-700 ring-1 ring-slate-300/50`;
  return `${base} bg-slate-100 text-slate-600`;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<DashboardChartPoint[]>([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Failed to load dashboard");
        return;
      }
      if (json.success && json.data) {
        const d = json.data as { stats?: DashboardStats; recentOrders?: RecentOrder[]; chartData?: DashboardChartPoint[] };
        setStats(d.stats ?? null);
        setRecentOrders(d.recentOrders ?? []);
        setChartData(d.chartData ?? []);
      }
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const maxRevenue = Math.max(...chartData.map((p) => p.revenue), 0);
  const maxOrders = Math.max(...chartData.map((p) => p.orders), 0);
  const linePoints = chartData
    .map((point, index) => {
      const x = chartData.length <= 1 ? 16 : 16 + (index * 268) / (chartData.length - 1);
      const y = 140 - (maxRevenue > 0 ? (point.revenue / maxRevenue) * 120 : 0);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="min-h-full bg-slate-50/80 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          const accent = accentStyles[stat.accent] ?? accentStyles.indigo;
          const value = stats ? stats[stat.valueKey] : "—";
          const change = stats ? stats[stat.changeKey] : null;
          const trend = change?.startsWith("+") ? "up" : "down";
          const cardClass =
            "group relative block overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2";
          return (
            <Link key={stat.key} href={stat.href} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {loading && !stats ? "—" : value}
                  </p>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      change ? (trend === "up" ? "text-emerald-600" : "text-slate-500") : "text-slate-400"
                    }`}
                  >
                    {loading && !stats ? "—" : change ? `${change} from last month` : "—"}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            {chartData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-slate-400">No chart data</div>
            ) : (
              <>
                <svg viewBox="0 0 300 160" className="h-56 w-full">
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={linePoints}
                  />
                  {chartData.map((point, index) => {
                    const x = chartData.length <= 1 ? 16 : 16 + (index * 268) / (chartData.length - 1);
                    const y = 140 - (maxRevenue > 0 ? (point.revenue / maxRevenue) * 120 : 0);
                    return <circle key={point.key} cx={x} cy={y} r="3.5" fill="#f59e0b" />;
                  })}
                </svg>
                <div className="mt-2 grid grid-cols-6 gap-1 text-center text-xs text-slate-500">
                  {chartData.map((point) => (
                    <div key={point.key} title={point.revenueFormatted}>
                      {point.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <Link
          href="/admin/orders"
          className="block overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2"
        >
          <h3 className="text-base font-semibold text-slate-900">Orders Overview</h3>
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            {chartData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-slate-400">No chart data</div>
            ) : (
              <>
                <div className="flex h-56 items-end gap-2">
                  {chartData.map((point) => {
                    const barHeight = maxOrders > 0 ? Math.max(10, Math.round((point.orders / maxOrders) * 180)) : 10;
                    return (
                      <div key={point.key} className="flex flex-1 flex-col items-center justify-end gap-2">
                        <div
                          className="w-full rounded-t-md bg-emerald-400/90 transition-all"
                          style={{ height: `${barHeight}px` }}
                          title={`${point.orders.toLocaleString()} orders`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-6 gap-1 text-center text-xs text-slate-500">
                  {chartData.map((point) => (
                    <div key={point.key}>{point.label}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Link>
      </div>

      {/* Recent orders table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
          >
            View all orders →
          </Link>
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
              {loading && recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No recent orders
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-slate-900 hover:text-amber-600 hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {order.customer}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {order.seller}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                      {order.amountFormatted}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
