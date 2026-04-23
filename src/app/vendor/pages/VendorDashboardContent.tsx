import { Link } from "../../components/Link";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  LucideIcon,
} from "lucide-react";
import { Button, Card, Alert } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import type { VendorDashboardSummary } from "@/services/types/vendor.types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    new: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
    shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  };
  const config = statusConfig[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
  return <span className={`${config.color} text-xs font-bold px-2 py-1 rounded`}>{config.label}</span>;
}

export type StatItem = {
  label: string;
  value: string;
  change: string;
  trend: string;
  icon: LucideIcon;
  color: string;
};

export interface VendorDashboardContentProps {
  data: VendorDashboardSummary | null | undefined;
  error: unknown;
  isLoading: boolean;
  refetch: () => void;
  stats: StatItem[] | null;
  recentOrders: VendorDashboardSummary["recentOrders"];
  lowStockProducts: VendorDashboardSummary["lowStockProducts"];
}

export function VendorDashboardContent({
  data,
  error,
  isLoading,
  refetch,
  stats,
  recentOrders,
  lowStockProducts,
}: VendorDashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Dashboard</h1>
        <p className="text-[#64748B]">Welcome back! Here&apos;s your store overview</p>
      </div>

      <DataState
        isLoading={isLoading}
        error={error instanceof Error ? error.message : typeof error === "string" ? error : null}
        retry={refetch}
      >
        {data && (
          <>
            {/* Alerts */}
            {data.pendingOrdersCount > 0 && (
              <div className="space-y-4">
                <Alert
                  type="warning"
                  title="Action Required"
                  message={`You have ${data.pendingOrdersCount} pending order${data.pendingOrdersCount !== 1 ? "s" : ""} that need your attention. Please accept or reject them.`}
                />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats?.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {stat.trend === "up" && (
                        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                          <ArrowUp className="w-4 h-4" />
                          {stat.change}
                        </div>
                      )}
                      {stat.trend === "down" && (
                        <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                          <ArrowDown className="w-4 h-4" />
                          {stat.change}
                        </div>
                      )}
                      {stat.trend === "neutral" && stat.change !== "Needs Action" && (
                        <div className="text-[#64748B] text-sm">{stat.change}</div>
                      )}
                      {stat.trend === "alert" && (
                        <div className="flex items-center gap-1 text-orange-600 text-sm font-semibold">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <p className="text-[#64748B] text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#1E293B]">{stat.value}</p>
                    {stat.trend === "neutral" && <p className="text-sm text-[#64748B] mt-1">{stat.change} of revenue</p>}
                    {stat.trend === "alert" && <p className="text-sm text-orange-600 font-semibold mt-1">{stat.change}</p>}
                  </div>
                );
              })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2">
                <Card
                  title="Recent Orders"
                  actions={
                    <Link href="/vendor/orders" className="text-[#3B82F6] hover:text-[#2563EB] font-semibold text-sm flex items-center gap-1">
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  }
                >
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-[#1E293B]">{order.displayId ?? order.id}</p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-[#64748B]">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1E293B] mb-1">{formatCurrency(order.amount)}</p>
                          <p className="text-xs text-[#64748B]">{order.timeAgo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Net Payable */}
                <Card title="Net Earnings (Balance)">
                  <div className="text-center py-6">
                    <p className="text-sm text-[#64748B] mb-2">After paid payouts</p>
                    <p className="text-4xl font-bold text-[#3B82F6] mb-4">
                      {formatCurrency(data.netPayable ?? 0)}
                    </p>
                    <Link href="/vendor/earnings">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Earnings
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Low Stock Alert */}
                <Card title="Low stock (manage inventory)">
                  <div className="space-y-3">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-sm text-[#64748B] text-center py-4">
                        No products at or below the low-stock threshold. You&apos;re fully stocked.
                      </p>
                    ) : (
                      lowStockProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/vendor/products/edit/${encodeURIComponent(product.id)}`}
                          className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-semibold text-[#1E293B] text-sm truncate">{product.name}</p>
                            <p className="text-xs text-[#64748B] truncate">SKU: {product.sku}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-red-600">{product.stock} in stock</p>
                            <p className="text-[11px] text-[#3B82F6] font-medium">Edit →</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link href="/vendor/products" className="block mt-4">
                    <Button variant="ghost" size="sm" className="w-full">
                      Manage inventory
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Quick Links */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link
                  href="/vendor/orders"
                  className="flex flex-col items-center gap-3 p-6 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-[#1E293B]">Manage Orders</p>
                </Link>
                <Link
                  href="/vendor/products"
                  className="flex flex-col items-center gap-3 p-6 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-[#1E293B]">My Products</p>
                </Link>
                <Link
                  href="/vendor/earnings"
                  className="flex flex-col items-center gap-3 p-6 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-semibold text-[#1E293B]">View Earnings</p>
                </Link>
                <Link
                  href="/vendor/reports"
                  className="flex flex-col items-center gap-3 p-6 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="font-semibold text-[#1E293B]">Download Reports</p>
                </Link>
              </div>
            </Card>
          </>
        )}
      </DataState>
    </div>
  );
}
