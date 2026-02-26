import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Camera, Edit2 } from "lucide-react";

export function MyProfilePage() {
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
                  className="flex items-center gap-3 px-4 py-3 bg-[#2563EB] text-white rounded-xl font-semibold"
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
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                      JD
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-white hover:bg-[#1D4ED8] transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#111827] mb-1">John Doe</h2>
                    <p className="text-gray-600">john.doe@email.com</p>
                    <p className="text-gray-600">+1 234 567 8900</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#2563EB] text-[#2563EB] rounded-xl hover:bg-[#2563EB] hover:text-white transition-colors font-semibold">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#F9FAFB] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-[#111827] mb-1">24</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-[#111827] mb-1">12</p>
                  <p className="text-sm text-gray-600">Wishlist Items</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-[#111827] mb-1">3</p>
                  <p className="text-sm text-gray-600">Saved Addresses</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-[#111827] mb-6">Personal Information</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="john.doe@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 234 567 8900"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    defaultValue="1990-01-15"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Gender
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-[#2563EB] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-[#111827] mb-6">Change Password</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors bg-[#F9FAFB]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#111827] text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
