import { DollarSign, ShoppingBag, Users, TrendingUp, FileCheck, RotateCcw } from "lucide-react";

const statsCards = [
  { icon: DollarSign, label: "GMV", value: "$2,450,000", change: "+12.5%" },
  { icon: ShoppingBag, label: "Total Orders", value: "15,248", change: "+8.2%" },
  { icon: Users, label: "Total Sellers", value: "1,234", change: "+15.3%" },
  { icon: TrendingUp, label: "Revenue", value: "$245,000", change: "+10.8%" },
  { icon: FileCheck, label: "Pending KYC", value: "23", change: "-5.2%" },
  { icon: RotateCcw, label: "Pending Returns", value: "47", change: "+2.1%" },
];

const recentOrders = [
  { id: "#ORD-12345", customer: "John Doe", seller: "Tech Store", amount: "$299.99", status: "Delivered", date: "2026-02-18" },
  { id: "#ORD-12344", customer: "Jane Smith", seller: "Fashion Hub", amount: "$149.99", status: "Shipped", date: "2026-02-18" },
  { id: "#ORD-12343", customer: "Bob Johnson", seller: "Home Decor", amount: "$89.99", status: "Processing", date: "2026-02-17" },
  { id: "#ORD-12342", customer: "Alice Brown", seller: "Sports Gear", amount: "$199.99", status: "Pending", date: "2026-02-17" },
  { id: "#ORD-12341", customer: "Charlie Wilson", seller: "Electronics Plus", amount: "$449.99", status: "Delivered", date: "2026-02-16" },
];

export function AdminDashboard() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border-2 border-gray-400 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-bold">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm mt-2 text-gray-700">
                    {stat.change} from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-64 bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">LINE CHART</p>
              <p className="text-xs text-gray-500 mt-1">Revenue Trend</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Orders Overview</h3>
          <div className="h-64 bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">BAR CHART</p>
              <p className="text-xs text-gray-500 mt-1">Orders Trend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="p-6 border-b-2 border-gray-400">
          <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.seller}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
