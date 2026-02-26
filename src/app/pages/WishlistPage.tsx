import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Heart, X, Star } from "lucide-react";

export function WishlistPage() {
  const wishlistItems = [
    { id: 1, name: "Premium Cotton T-Shirt", price: 29.99, oldPrice: 39.99, rating: 4.8, inStock: true },
    { id: 2, name: "Classic Denim Jeans", price: 79.99, rating: 4.9, inStock: true },
    { id: 3, name: "Leather Sneakers", price: 129.99, oldPrice: 159.99, rating: 4.7, inStock: false },
    { id: 4, name: "Casual Backpack", price: 49.99, rating: 4.6, inStock: true },
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
                  className="flex items-center gap-3 px-4 py-3 bg-[#2563EB] text-white rounded-xl font-semibold"
                >
                  <Heart className="w-5 h-5" />
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
                <div>
                  <h1 className="text-3xl font-bold text-[#111827] mb-2">My Wishlist</h1>
                  <p className="text-gray-600">{wishlistItems.length} items</p>
                </div>
                <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-[#DC2626] hover:text-[#DC2626] rounded-xl font-semibold transition-colors">
                  Clear All
                </button>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group relative">
                    {/* Remove Button */}
                    <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#DC2626] hover:text-white transition-colors shadow-lg">
                      <X className="w-5 h-5" />
                    </button>

                    {/* Sale Badge */}
                    {item.oldPrice && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#DC2626] text-white text-sm font-bold rounded-lg">
                        Sale
                      </div>
                    )}

                    {/* Stock Badge */}
                    {!item.inStock && (
                      <div className="absolute bottom-40 left-0 right-0 bg-gray-900 bg-opacity-90 text-white text-center py-3 font-bold">
                        Out of Stock
                      </div>
                    )}

                    {/* Product Image */}
                    <Link href={`/product/${item.id}`} className="block">
                      <div className={`aspect-[4/5] ${
                        item.id % 4 === 1 ? "bg-gradient-to-br from-blue-200 to-indigo-300" :
                        item.id % 4 === 2 ? "bg-gradient-to-br from-purple-200 to-pink-300" :
                        item.id % 4 === 3 ? "bg-gradient-to-br from-green-200 to-emerald-300" :
                        "bg-gradient-to-br from-orange-200 to-red-300"
                      } group-hover:scale-105 transition-transform duration-500`}></div>
                    </Link>

                    <div className="p-4">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({item.rating})</span>
                      </div>

                      {/* Product Name */}
                      <Link href={`/product/${item.id}`}>
                        <h3 className="font-semibold text-[#111827] mb-2 hover:text-[#2563EB] transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-xl font-bold text-[#111827]">${item.price}</p>
                        {item.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">${item.oldPrice}</span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        disabled={!item.inStock}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          item.inStock
                            ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md hover:shadow-lg"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {item.inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
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
