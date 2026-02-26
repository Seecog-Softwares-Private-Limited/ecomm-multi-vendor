import { Bell, Search, User } from "lucide-react";
import { Link } from "../Link";

export function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b-2 border-gray-400 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-700 hover:bg-gray-100 border-2 border-gray-400">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gray-700 rounded-full"></span>
        </button>

        {/* Profile */}
        <Link href="/admin/settings" className="flex items-center gap-3 pl-3 pr-4 py-2 border-2 border-gray-400 hover:bg-gray-100">
          <div className="w-8 h-8 bg-gray-700 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-600">Super Admin</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
