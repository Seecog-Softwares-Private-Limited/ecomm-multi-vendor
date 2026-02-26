import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Package, Truck, Check, X } from "lucide-react";

export function MyOrdersPage() {
  const orders = [
    {
      id: "#ORD-2026-1234",
      date: "Feb 20, 2026",
      items: 3,
      total: 273.97,
      status: "Delivered",
      statusColor: "bg-[#16A34A]",
    },
    {
      id: "#ORD-2026-1233",
      date: "Feb 18, 2026",
      items: 2,
      total: 189.99,
      status: "In Transit",
      statusColor: "bg-[#2563EB]",
    },
    {
      id: "#ORD-2026-1232",
      date: "Feb 15, 2026",
      items: 1,
      total: 129.99,
      status: "Processing",
      statusColor: "bg-[#F59E0B]",
    },
    {
      id: "#ORD-2026-1231",
      date: "Feb 10, 2026",
      items: 4,
      total: 459.96,
      status: "Cancelled",
      statusColor: "bg-[#DC2626]",
    },
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-2xl font-bold text-[#111827]">ShopHub</Link>
            <div className="flex items-center gap-6">
              <Search className="w-5 h-5 text-[#111827] hover:text-[#2563EB] cursor-pointer" />
              <Link href="/cart" className="relative text-[#111827] hover:text-[#2563EB]">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#2563EB] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
              </Link>
              <User className="w-5 h-5 text-[#2563EB]" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
              <nav className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F9FAFB] rounded-xl font-semibold transition-colors"
                >
                  <User className="w-5 h-5" />
                  My Profile
                </Link>
                <Link
                  href="/my-orders"
                  className="flex items-center gap-3 px-4 py-3 bg-[#2563EB] text-white rounded-xl font-semibold"
                >
                  <ShoppingBag className="w-5 h-5" />
                  My Orders
                </Link>
                <Link
                  href="/address-management"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F9FAFB] rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Addresses
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F9FAFB] rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </Link>
                <Link
                  href="/support-tickets"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F9FAFB] rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Support
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-[#111827] mb-8">My Orders</h1>

              {/* Filter Tabs */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                <button className="px-6 py-2 bg-[#2563EB] text-white rounded-xl font-semibold whitespace-nowrap">
                  All Orders
                </button>
                <button className="px-6 py-2 border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold whitespace-nowrap transition-colors">
                  Delivered
                </button>
                <button className="px-6 py-2 border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold whitespace-nowrap transition-colors">
                  In Transit
                </button>
                <button className="px-6 py-2 border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold whitespace-nowrap transition-colors">
                  Cancelled
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order ID</p>
                        <p className="font-bold text-[#111827]">{order.id}</p>
                      </div>
                      <span className={`${order.statusColor} text-white px-4 py-2 rounded-xl text-sm font-bold`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Date</p>
                        <p className="font-semibold text-[#111827]">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Items</p>
                        <p className="font-semibold text-[#111827]">{order.items} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="font-bold text-[#2563EB] text-lg">${order.total}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/order-detail/${order.id}`}
                        className="flex-1 bg-[#2563EB] text-white py-3 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors text-center"
                      >
                        View Details
                      </Link>
                      {order.status === "Delivered" && (
                        <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-[#DC2626] hover:text-[#DC2626] rounded-xl font-semibold transition-colors">
                          Return
                        </button>
                      )}
                      {order.status === "In Transit" && (
                        <Link
                          href={`/track-order/${order.id}`}
                          className="px-6 py-3 border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded-xl font-semibold transition-colors"
                        >
                          Track Order
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
