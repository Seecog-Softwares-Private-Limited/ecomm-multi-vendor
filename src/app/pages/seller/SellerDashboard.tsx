import { Link } from "../../components/Link";
import {
  DollarSign, ShoppingBag, Package, AlertTriangle, RotateCcw,
  TrendingUp, Eye, Plus, Download
} from "lucide-react";

const revenueData = [
  { day: "Mon", revenue: 2400 },
  { day: "Tue", revenue: 3200 },
  { day: "Wed", revenue: 2800 },
  { day: "Thu", revenue: 3900 },
  { day: "Fri", revenue: 4200 },
  { day: "Sat", revenue: 3800 },
  { day: "Sun", revenue: 3500 },
];

const recentOrders = [
  { id: "#ORD-12890", product: "Wireless Headphones", qty: 2, amount: "$599.98", status: "New", date: "2026-02-20" },
  { id: "#ORD-12887", product: "Smart Watch", qty: 1, amount: "$399.99", status: "Processing", date: "2026-02-20" },
  { id: "#ORD-12885", product: "Bluetooth Speaker", qty: 3, amount: "$239.97", status: "Shipped", date: "2026-02-19" },
  { id: "#ORD-12880", product: "USB-C Hub", qty: 1, amount: "$39.99", status: "Delivered", date: "2026-02-19" },
];

const lowStockProducts = [
  { id: 1, name: "Wireless Mouse", sku: "WM-001", stock: 5, image: "MOUSE" },
  { id: 2, name: "Keyboard Mechanical", sku: "KB-045", stock: 3, image: "KEYBOARD" },
  { id: 3, name: "Webcam HD", sku: "WC-023", stock: 7, image: "WEBCAM" },
];

export function SellerDashboard() {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-sm text-gray-700">Welcome back, Tech Store Pro</p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {/* Today's Revenue */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Today</p>
            <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">$3,500</h3>
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <TrendingUp className="w-3 h-3" />
            <span>+12.5%</span>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">This Week</p>
            <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">$23,800</h3>
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <TrendingUp className="w-3 h-3" />
            <span>+8.3%</span>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">This Month</p>
            <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">$89,300</h3>
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <TrendingUp className="w-3 h-3" />
            <span>+15.2%</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Total Orders</p>
            <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">1,247</h3>
          <p className="text-xs text-gray-600">This month</p>
        </div>

        {/* Pending Returns */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Pending</p>
            <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">7</h3>
          <p className="text-xs text-gray-600">Return requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Graph */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Revenue Trend</h3>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border-2 border-gray-800 bg-gray-200 font-bold">7 Days</button>
              <button className="px-3 py-1 text-xs border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">30 Days</button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-48">
                  <div
                    className="w-full bg-gray-700 border-2 border-gray-800 relative group cursor-pointer hover:bg-gray-800 transition-colors"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${data.revenue}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-700">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Summary */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Orders Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-2 border-gray-400 bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">New Orders</p>
                <p className="text-xs text-gray-600">Need action</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
            </div>

            <div className="flex items-center justify-between p-3 border-2 border-gray-400 bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">Processing</p>
                <p className="text-xs text-gray-600">In progress</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">28</div>
            </div>

            <div className="flex items-center justify-between p-3 border-2 border-gray-400 bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">Shipped</p>
                <p className="text-xs text-gray-600">In transit</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">45</div>
            </div>

            <div className="flex items-center justify-between p-3 border-2 border-gray-400 bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">Delivered</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">156</div>
            </div>
          </div>

          <Link
            href="/seller/orders"
            className="block mt-4 w-full py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold text-center text-sm"
          >
            View All Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Low Stock Alert</h3>
                <p className="text-sm text-gray-600">Products running low</p>
              </div>
            </div>
            <Link
              href="/seller/inventory"
              className="px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold text-sm"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-3 border-2 border-gray-400 bg-gray-50">
                <div className="w-16 h-16 bg-gray-300 border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-600">{product.image}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="px-2 py-1 bg-gray-800 border border-gray-900 text-white text-xs font-bold">
                    {product.stock} left
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link
              href="/seller/orders"
              className="px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold text-sm"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-3 border-2 border-gray-400 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm">{order.id}</h4>
                    <p className="text-sm text-gray-700 truncate">{order.product} × {order.qty}</p>
                    <p className="text-xs text-gray-600">{order.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900 text-sm mb-1">{order.amount}</p>
                    <span className="inline-flex px-2 py-0.5 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {order.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/seller/orders/${order.id}`}
                  className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-bold"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Details</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white border-2 border-gray-400 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/seller/products/new"
            className="p-4 border-2 border-gray-400 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 bg-gray-700 border-2 border-gray-800 group-hover:bg-gray-800 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Add Product</span>
          </Link>

          <Link
            href="/seller/inventory"
            className="p-4 border-2 border-gray-400 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 bg-gray-700 border-2 border-gray-800 group-hover:bg-gray-800 flex items-center justify-center transition-colors">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Manage Inventory</span>
          </Link>

          <Link
            href="/seller/orders"
            className="p-4 border-2 border-gray-400 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 bg-gray-700 border-2 border-gray-800 group-hover:bg-gray-800 flex items-center justify-center transition-colors">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">View Orders</span>
          </Link>

          <button className="p-4 border-2 border-gray-400 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 group">
            <div className="w-12 h-12 bg-gray-700 border-2 border-gray-800 group-hover:bg-gray-800 flex items-center justify-center transition-colors">
              <Download className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
