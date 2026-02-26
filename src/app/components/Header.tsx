import { Link } from "./Link";
import { Search, ShoppingCart, User } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b-2 border-gray-300">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-32 h-10 bg-gray-400 flex items-center justify-center border-2 border-gray-500">
              <span className="text-sm font-bold text-gray-700">LOGO</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Cart and Login */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 border-2 border-gray-400">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 border-2 border-gray-700 bg-gray-700 text-white hover:bg-gray-800 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
