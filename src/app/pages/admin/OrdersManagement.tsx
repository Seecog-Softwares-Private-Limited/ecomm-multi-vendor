import { Link } from "../../components/Link";
import { Filter, Eye, DollarSign, ShoppingBag, TrendingUp, Package } from "lucide-react";

const stats = [
  { icon: ShoppingBag, label: "Total Orders", value: "15,248" },
  { icon: DollarSign, label: "Total Revenue", value: "$2,450,000" },
  { icon: Package, label: "Pending Orders", value: "234" },
  { icon: TrendingUp, label: "Completed Orders", value: "14,567" },
];

const orders = [
  { id: "#ORD-12345", customer: "John Doe", seller: "Tech Store", amount: "$299.99", paymentStatus: "Paid", orderStatus: "Delivered", date: "2026-02-18" },
  { id: "#ORD-12344", customer: "Jane Smith", seller: "Fashion Hub", amount: "$149.99", paymentStatus: "Paid", orderStatus: "Shipped", date: "2026-02-18" },
  { id: "#ORD-12343", customer: "Bob Johnson", seller: "Home Decor", amount: "$89.99", paymentStatus: "Paid", orderStatus: "Processing", date: "2026-02-17" },
  { id: "#ORD-12342", customer: "Alice Brown", seller: "Sports Gear", amount: "$199.99", paymentStatus: "Pending", orderStatus: "Pending", date: "2026-02-17" },
  { id: "#ORD-12341", customer: "Charlie Wilson", seller: "Electronics Plus", amount: "$449.99", paymentStatus: "Paid", orderStatus: "Delivered", date: "2026-02-16" },
  { id: "#ORD-12340", customer: "Diana Lee", seller: "Beauty Store", amount: "$79.99", paymentStatus: "Paid", orderStatus: "Shipped", date: "2026-02-16" },
];

export function OrdersManagement() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-sm text-gray-700 mt-1">Manage and track all orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border-2 border-gray-400 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-700 font-bold">{stat.label}</p>
                <div className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex gap-4">
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

          <input
            type="date"
            className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
          />

          <input
            type="date"
            className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
          />

          <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold">
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Order Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.seller}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id.replace('#', '')}`}
                      className="inline-flex p-2 border-2 border-gray-400 hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t-2 border-gray-400 flex items-center justify-between">
          <p className="text-sm text-gray-700 font-bold">Showing 1 to 6 of 15,248 orders</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Previous</button>
            <button className="px-3 py-1 bg-gray-700 text-white border-2 border-gray-800 text-sm font-bold">1</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">2</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">3</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
