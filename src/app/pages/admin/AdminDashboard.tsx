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

const statsConfig = [
  {
    key: "gmv" as const,
    icon: DollarSign,
    label: "GMV",
    valueKey: "gmvFormatted" as const,
    changeKey: "gmvChange" as const,
    accent: "indigo",
  },
  {
    key: "orders" as const,
    icon: ShoppingBag,
    label: "Total Orders",
    valueKey: "totalOrdersFormatted" as const,
    changeKey: "totalOrdersChange" as const,
    accent: "emerald",
  },
  {
    key: "sellers" as const,
    icon: Users,
    label: "Total Sellers",
    valueKey: "totalSellersFormatted" as const,
    changeKey: "totalSellersChange" as const,
    accent: "violet",
  },
  {
    key: "revenue" as const,
    icon: TrendingUp,
    label: "Revenue",
    valueKey: "revenueFormatted" as const,
    changeKey: "revenueChange" as const,
    accent: "amber",
  },
  {
    key: "kyc" as const,
    icon: FileCheck,
    label: "Pending KYC",
    valueKey: "pendingKycFormatted" as const,
    changeKey: "pendingKycChange" as const,
    accent: "sky",
  },
  {
    key: "returns" as const,
    icon: RotateCcw,
    label: "Pending Returns",
    valueKey: "pendingReturnsFormatted" as const,
    changeKey: "pendingReturnsChange" as const,
    accent: "rose",
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
        const d = json.data as { stats?: DashboardStats; recentOrders?: RecentOrder[] };
        setStats(d.stats ?? null);
        setRecentOrders(d.recentOrders ?? []);
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
          return (
            <div
              key={stat.key}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-200"
            >
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
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
          <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">Line chart</p>
              <p className="mt-0.5 text-xs text-slate-400">Revenue trend</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Orders Overview</h3>
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
          <h3 className="text-base font-semibold text-slate-900">Recent Orders</h3>
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
