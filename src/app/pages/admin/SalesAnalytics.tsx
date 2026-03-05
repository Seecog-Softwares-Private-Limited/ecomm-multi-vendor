"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, TrendingUp, TrendingDown, BarChart3, DollarSign, ShoppingCart, Receipt, Percent } from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

interface Metrics {
  totalRevenue: string;
  totalRevenueChange: number;
  totalRevenueChangeFormatted: string;
  totalOrders: string;
  totalOrdersChange: number;
  totalOrdersChangeFormatted: string;
  averageOrderValue: string;
  averageOrderValueChange: number;
  averageOrderValueChangeFormatted: string;
  conversionRate: string;
  conversionRateChange: number;
  conversionRateChangeFormatted: string;
}

interface TopSeller {
  rank: number;
  name: string;
  revenue: string;
  orders: number;
  growth: string;
}

interface TopProduct {
  rank: number;
  name: string;
  category: string;
  sales: number;
  revenue: string;
}

const metricCardsConfig = [
  {
    key: "revenue" as const,
    label: "Total Revenue",
    icon: DollarSign,
    accent: "amber",
  },
  {
    key: "orders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
    accent: "emerald",
  },
  {
    key: "aov" as const,
    label: "Average Order Value",
    icon: Receipt,
    accent: "blue",
  },
  {
    key: "conversion" as const,
    label: "Conversion Rate",
    icon: Percent,
    accent: "slate",
  },
];

const accentStyles: Record<string, { bg: string; text: string; ring: string }> = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200" },
};

function getMetricValue(metrics: Metrics | null, key: (typeof metricCardsConfig)[number]["key"]) {
  if (!metrics) return { value: "—", change: "—", trend: "up" as const };
  switch (key) {
    case "revenue":
      return {
        value: metrics.totalRevenue,
        change: metrics.totalRevenueChangeFormatted,
        trend: (metrics.totalRevenueChange >= 0 ? "up" : "down") as "up" | "down",
      };
    case "orders":
      return {
        value: metrics.totalOrders,
        change: metrics.totalOrdersChangeFormatted,
        trend: (metrics.totalOrdersChange >= 0 ? "up" : "down") as "up" | "down",
      };
    case "aov":
      return {
        value: metrics.averageOrderValue,
        change: metrics.averageOrderValueChangeFormatted,
        trend: (metrics.averageOrderValueChange >= 0 ? "up" : "down") as "up" | "down",
      };
    case "conversion":
      return {
        value: metrics.conversionRate,
        change: metrics.conversionRateChangeFormatted,
        trend: "up" as const,
      };
    default:
      return { value: "—", change: "—", trend: "up" as const };
  }
}

export function SalesAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30d");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?period=${encodeURIComponent(period)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Failed to load analytics");
        return;
      }
      if (json.success && json.data) {
        const d = json.data as {
          metrics?: Metrics;
          topSellers?: TopSeller[];
          topProducts?: TopProduct[];
        };
        setMetrics(d.metrics ?? null);
        setTopSellers(d.topSellers ?? []);
        setTopProducts(d.topProducts ?? []);
      }
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Sales Analytics
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              View detailed sales performance and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Key metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCardsConfig.map((card) => {
            const style = accentStyles[card.accent];
            const TrendIcon = getMetricValue(metrics, card.key).trend === "up" ? TrendingUp : TrendingDown;
            const MetricIcon = card.icon;
            const { value, change, trend } = getMetricValue(metrics, card.key);
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 transition hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {loading && !metrics ? "—" : value}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <TrendIcon
                        className={trend === "up" ? "h-4 w-4 text-emerald-600" : "h-4 w-4 text-rose-500"}
                      />
                      <span className={trend === "up" ? "text-emerald-600" : "text-rose-600"}>
                        {loading && !metrics ? "—" : change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${style.bg} ${style.text} ${style.ring}`}
                  >
                    <MetricIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
            </div>
            <div className="flex h-72 items-center justify-center bg-slate-50/50 px-6 py-8">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Chart placeholder</p>
                <p className="mt-1 text-xs text-slate-400">Monthly revenue performance</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Orders Trend</h3>
            </div>
            <div className="flex h-72 items-center justify-center bg-slate-50/50 px-6 py-8">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Chart placeholder</p>
                <p className="mt-1 text-xs text-slate-400">Monthly order volume</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top performers */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Sellers */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Top Sellers</h3>
              <p className="mt-0.5 text-sm text-slate-500">By revenue this period</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rank
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Seller
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Revenue
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Orders
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && topSellers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        Loading…
                      </td>
                    </tr>
                  ) : topSellers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        No data for this period
                      </td>
                    </tr>
                  ) : (
                    topSellers.map((seller) => (
                      <tr key={seller.rank} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                            {seller.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {seller.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {seller.revenue}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {seller.orders.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {seller.growth}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Top Products</h3>
              <p className="mt-0.5 text-sm text-slate-500">By sales this period</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rank
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Sales
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        Loading…
                      </td>
                    </tr>
                  ) : topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                        No data for this period
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((product) => (
                      <tr key={product.rank} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                            {product.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {product.sales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {product.revenue}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
