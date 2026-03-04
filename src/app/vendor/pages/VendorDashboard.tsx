"use client";

import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import { isVendorApproved } from "@/lib/vendor-onboarding";
import * as React from "react";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { OnboardingCard } from "@/app/vendor/components/OnboardingCard";
import { VendorDashboardContent, type StatItem } from "./VendorDashboardContent";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

function ApprovedDashboardContent() {
  const { data, error, isLoading, refetch } = useApi(() =>
    vendorService.getDashboard()
  );

  const stats = React.useMemo((): StatItem[] | null => {
    if (!data) return null;
    const rev30 = data.totalRevenue30d;
    const comm30 = data.commission30d;
    const commissionPct = rev30 > 0 ? Math.round((comm30 / rev30) * 100) : 0;
    return [
      {
        label: "Today's Orders",
        value: String(data.todayOrdersCount),
        change: data.todayOrdersChangePercent != null ? `${data.todayOrdersChangePercent >= 0 ? "+" : ""}${data.todayOrdersChangePercent}%` : "—",
        trend: data.todayOrdersChangePercent != null && data.todayOrdersChangePercent >= 0 ? "up" : data.todayOrdersChangePercent != null ? "down" : "neutral",
        icon: ShoppingBag,
        color: "from-blue-500 to-indigo-600",
      },
      {
        label: "Pending Orders",
        value: String(data.pendingOrdersCount),
        change: "Needs Action",
        trend: "alert",
        icon: Clock,
        color: "from-orange-500 to-red-600",
      },
      {
        label: "Total Revenue (30d)",
        value: formatCurrency(data.totalRevenue30d),
        change: data.todayOrdersChangePercent != null ? `${data.todayOrdersChangePercent >= 0 ? "+" : ""}${data.todayOrdersChangePercent}%` : "—",
        trend: data.todayOrdersChangePercent != null && data.todayOrdersChangePercent >= 0 ? "up" : "down",
        icon: DollarSign,
        color: "from-green-500 to-emerald-600",
      },
      {
        label: "Commission Deducted",
        value: formatCurrency(data.commission30d),
        change: `${commissionPct}%`,
        trend: "neutral",
        icon: TrendingUp,
        color: "from-purple-500 to-pink-600",
      },
    ];
  }, [data]);

  const recentOrders = data?.recentOrders ?? [];
  const lowStockProducts = data?.lowStockProducts ?? [];

  return (
    <VendorDashboardContent
      data={data}
      error={error}
      isLoading={isLoading}
      refetch={refetch}
      stats={stats}
      recentOrders={recentOrders}
      lowStockProducts={lowStockProducts}
    />
  );
}

export function VendorDashboard() {
  const { data: me, error: meError, isLoading: meLoading } = useApi(() =>
    vendorService.getMe()
  );

  if (meLoading || !me) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (meError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Failed to load your account. Please refresh or try again later.
      </div>
    );
  }

  if (!isVendorApproved(me.status)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Complete onboarding to access your full dashboard</p>
        </div>
        <OnboardingCard
          emailVerified={me.emailVerified}
          rawStatus={me.rawStatus}
        />
      </div>
    );
  }

  return <ApprovedDashboardContent />;
}
