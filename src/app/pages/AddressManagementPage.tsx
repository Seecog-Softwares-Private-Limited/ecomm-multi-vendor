import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Plus, Edit2, Trash2, MapPin } from "lucide-react";

export function AddressManagementPage() {
  const addresses = [
    {
      id: 1,
      type: "Home",
      name: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "New York, NY 10001",
      phone: "+1 234 567 8900",
      isDefault: true,
    },
    {
      id: 2,
      type: "Office",
      name: "John Doe",
      address: "456 Business Ave, Suite 200",
      city: "New York, NY 10002",
      phone: "+1 234 567 8901",
      isDefault: false,
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
                  className="flex items-center gap-3 px-4 py-3 bg-[#2563EB] text-white rounded-xl font-semibold"
                >
                  <MapPin className="w-5 h-5" />
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
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#111827]">Saved Addresses</h1>
                <Link
                  href="/add-address"
                  className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add New Address
                </Link>
              </div>

              {/* Addresses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all relative"
                  >
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 px-3 py-1 bg-[#16A34A] text-white text-xs rounded-lg font-bold">
                        Default
                      </span>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#2563EB] bg-opacity-10 rounded-xl flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-[#2563EB]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] text-lg">{address.type}</p>
                          <p className="text-sm text-gray-600">{address.name}</p>
                        </div>
                      </div>

                      <div className="pl-15">
                        <p className="text-gray-700 mb-1">{address.address}</p>
                        <p className="text-gray-700 mb-2">{address.city}</p>
                        <p className="text-gray-600 text-sm">{address.phone}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded-xl font-semibold transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 hover:border-[#DC2626] hover:text-[#DC2626] rounded-xl font-semibold transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>

                    {!address.isDefault && (
                      <button className="w-full mt-3 py-2 text-sm text-[#2563EB] hover:text-[#1D4ED8] font-semibold">
                        Set as Default
                      </button>
                    )}
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
