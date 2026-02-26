import { Link } from "../../components/Link";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  Plus,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button, Card, Alert } from "../components/UIComponents";
import * as React from "react";

export function VendorDashboard() {
  const stats = [
    {
      label: "Today's Orders",
      value: "12",
      change: "+8%",
      trend: "up",
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Pending Orders",
      value: "5",
      change: "Needs Action",
      trend: "alert",
      icon: Clock,
      color: "from-orange-500 to-red-600",
    },
    {
      label: "Total Revenue (30d)",
      value: "₹45,230",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Commission Deducted",
      value: "₹4,523",
      change: "10%",
      trend: "neutral",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
    },
  ];

  const recentOrders = [
    { id: "#ORD-1234", customer: "Rajesh Kumar", amount: "₹1,299", status: "pending", time: "10 mins ago" },
    { id: "#ORD-1233", customer: "Priya Sharma", amount: "₹2,499", status: "accepted", time: "1 hour ago" },
    { id: "#ORD-1232", customer: "Amit Patel", amount: "₹899", status: "shipped", time: "2 hours ago" },
    { id: "#ORD-1231", customer: "Sneha Reddy", amount: "₹3,499", status: "delivered", time: "3 hours ago" },
  ];

  const lowStockProducts = [
    { name: "Wireless Mouse", sku: "WM-001", stock: 3 },
    { name: "USB Cable", sku: "UC-002", stock: 5 },
    { name: "Phone Case", sku: "PC-003", stock: 2 },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
      accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
      shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
      delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
    };
    const config = statusConfig[status];
    return <span className={`${config.color} text-xs font-bold px-2 py-1 rounded`}>{config.label}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Dashboard</h1>
          <p className="text-[#64748B]">Welcome back! Here's your store overview</p>
        </div>
        <Link href="/vendor/products/create">
          <Button variant="primary">
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <Alert
          type="warning"
          title="Action Required"
          message="You have 5 pending orders that need your attention. Please accept or reject them."
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
                      <p className="font-bold text-[#1E293B]">{order.id}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-[#64748B]">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1E293B] mb-1">{order.amount}</p>
                    <p className="text-xs text-[#64748B]">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Net Payable */}
          <Card title="Net Payable">
            <div className="text-center py-6">
              <p className="text-sm text-[#64748B] mb-2">Available Balance</p>
              <p className="text-4xl font-bold text-[#3B82F6] mb-4">₹40,707</p>
              <Link href="/vendor/earnings">
                <Button variant="secondary" size="sm" className="w-full">
                  View Earnings
                </Button>
              </Link>
            </div>
          </Card>

          {/* Low Stock Alert */}
          <Card title="Low Stock Products">
            <div className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                  <div>
                    <p className="font-semibold text-[#1E293B] text-sm">{product.name}</p>
                    <p className="text-xs text-[#64748B]">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{product.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/vendor/products" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Manage Inventory
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
            href="/vendor/products/create"
            className="flex flex-col items-center gap-3 p-6 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-[#1E293B]">Add Product</p>
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
    </div>
  );
}
