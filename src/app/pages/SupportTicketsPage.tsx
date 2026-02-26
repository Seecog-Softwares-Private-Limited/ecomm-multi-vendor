import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Plus, MessageCircle, Clock } from "lucide-react";

export function SupportTicketsPage() {
  const tickets = [
    {
      id: "#TKT-001",
      subject: "Order not received",
      status: "Open",
      statusColor: "bg-[#F59E0B]",
      date: "Feb 24, 2026",
      lastUpdate: "2 hours ago",
    },
    {
      id: "#TKT-002",
      subject: "Refund request for damaged item",
      status: "In Progress",
      statusColor: "bg-[#2563EB]",
      date: "Feb 22, 2026",
      lastUpdate: "1 day ago",
    },
    {
      id: "#TKT-003",
      subject: "Question about product warranty",
      status: "Resolved",
      statusColor: "bg-[#16A34A]",
      date: "Feb 20, 2026",
      lastUpdate: "3 days ago",
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
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F9FAFB] rounded-xl font-semibold transition-colors"
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
                  className="flex items-center gap-3 px-4 py-3 bg-[#2563EB] text-white rounded-xl font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Support
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#111827] mb-2">Support Tickets</h1>
                  <p className="text-gray-600">Manage your support requests</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg">
                  <Plus className="w-5 h-5" />
                  New Ticket
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                <button className="px-6 py-2 bg-[#2563EB] text-white rounded-xl font-semibold whitespace-nowrap">
                  All Tickets
                </button>
                <button className="px-6 py-2 border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold whitespace-nowrap transition-colors">
                  Open
                </button>
                <button className="px-6 py-2 border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold whitespace-nowrap transition-colors">
                  In Progress
                </button>
                <button className="px-6 py-2 border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold whitespace-nowrap transition-colors">
                  Resolved
                </button>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-gray-600 font-semibold">{ticket.id}</span>
                          <span className={`${ticket.statusColor} text-white px-3 py-1 rounded-lg text-sm font-bold`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#111827] mb-2">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Created: {ticket.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Updated: {ticket.lastUpdate}
                          </div>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-[#F9FAFB] border-2 border-gray-200 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] rounded-xl font-semibold transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-3">Need Help?</h3>
              <p className="mb-6 text-white/90">
                Check out our help center for frequently asked questions and quick solutions.
              </p>
              <button className="px-8 py-3 bg-white text-[#2563EB] rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Visit Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
