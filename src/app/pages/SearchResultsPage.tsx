"use client";

import { Link } from "../components/Link";
import { Star, ShoppingCart, Search, ShoppingBag, User, Heart, SlidersHorizontal, X, SearchX } from "lucide-react";
import * as React from "react";

export function SearchResultsPage() {
  const [showFilters, setShowFilters] = React.useState(true);
  const [priceRange, setPriceRange] = React.useState({ min: "", max: "" });
  const [searchQuery, setSearchQuery] = React.useState("wireless headphones");
  const [activeFilters, setActiveFilters] = React.useState<string[]>(["AudioTech", "In Stock"]);

  const products = [
    { id: 1, name: "Premium Wireless Headphones", brand: "AudioTech", price: 129.99, oldPrice: 159.99, rating: 4.8, reviews: 234, inStock: true },
    { id: 2, name: "Studio Quality Headset", brand: "SoundPro", price: 199.99, rating: 4.9, reviews: 456, inStock: true },
    { id: 3, name: "Sport Wireless Earbuds", brand: "FitSound", price: 79.99, oldPrice: 99.99, rating: 4.7, reviews: 189, inStock: true },
    { id: 4, name: "Noise Cancelling Headphones", brand: "AudioTech", price: 249.99, rating: 4.9, reviews: 567, inStock: true },
    { id: 5, name: "Gaming Headset Pro", brand: "GameAudio", price: 159.99, rating: 4.6, reviews: 342, inStock: false },
    { id: 6, name: "Travel Earbuds", brand: "SoundPro", price: 89.99, rating: 4.5, reviews: 278, inStock: true },
    { id: 7, name: "Bluetooth Over-Ear", brand: "AudioTech", price: 119.99, oldPrice: 149.99, rating: 4.7, reviews: 412, inStock: true },
    { id: 8, name: "Professional Studio Phones", brand: "ProAudio", price: 299.99, rating: 4.8, reviews: 523, inStock: true },
    { id: 9, name: "Compact Wireless Buds", brand: "FitSound", price: 69.99, rating: 4.4, reviews: 156, inStock: true },
  ];

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setPriceRange({ min: "", max: "" });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-2xl font-bold text-[#1E293B]">ShopHub</Link>
            
            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-12 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all text-[#1E293B] bg-[#F8FAFC] shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#DC2626] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/wishlist" className="text-[#1E293B] hover:text-[#3B82F6] transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative text-[#1E293B] hover:text-[#3B82F6] transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#3B82F6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
              </Link>
              <Link href="/profile" className="text-[#1E293B] hover:text-[#3B82F6] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Enhanced Search Query Display */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#1E293B] mb-3">
                Results for <span className="text-[#3B82F6]">"{searchQuery}"</span>
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-sm text-[#64748B]">Found</span>
                  <span className="font-bold text-[#1E293B] text-lg">{products.length}</span>
                  <span className="text-sm text-[#64748B]">products</span>
                </div>
                <p className="text-[#64748B]">
                  Did you mean:{" "}
                  <Link href="#" className="text-[#3B82F6] font-semibold hover:underline">
                    wireless earphones
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#E2E8F0] rounded-xl hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all font-semibold shadow-sm"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Active Filters Bar */}
          {activeFilters.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-[#64748B]">Active Filters:</span>
                {activeFilters.map((filter) => (
                  <div
                    key={filter}
                    className="inline-flex items-center gap-2 bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] px-3 py-1.5 rounded-lg border border-[#3B82F6] border-opacity-20 font-medium"
                  >
                    <span className="text-sm">{filter}</span>
                    <button
                      onClick={() => removeFilter(filter)}
                      className="hover:bg-[#3B82F6] hover:text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-[#DC2626] font-semibold hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Enhanced Left Sidebar - Filters */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-6 space-y-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1E293B]">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-[#64748B] hover:text-[#1E293B] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Range */}
                <div className="pb-6 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#1E293B] mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none bg-[#F8FAFC] text-[#1E293B] transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none bg-[#F8FAFC] text-[#1E293B] transition-all"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div className="pb-6 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#1E293B] mb-4">Brand</h3>
                  <div className="space-y-3">
                    {['AudioTech', 'SoundPro', 'FitSound', 'GameAudio', 'ProAudio'].map((brand) => (
                      <label key={brand} className="flex items-center gap-3 text-[#64748B] cursor-pointer hover:text-[#3B82F6] transition-colors group">
                        <input
                          type="checkbox"
                          checked={activeFilters.includes(brand)}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-[#E2E8F0] text-[#3B82F6] focus:ring-[#3B82F6] transition-all"
                        />
                        <span className="font-medium group-hover:font-semibold">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="pb-6 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#1E293B] mb-4">Customer Rating</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2].map((rating) => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer hover:text-[#3B82F6] transition-colors group">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-[#E2E8F0] text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-[#E2E8F0]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-[#64748B] group-hover:text-[#3B82F6]">& Up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="pb-6">
                  <h3 className="font-semibold text-[#1E293B] mb-4">Availability</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-[#64748B] cursor-pointer hover:text-[#3B82F6] transition-colors">
                      <input
                        type="checkbox"
                        checked={activeFilters.includes("In Stock")}
                        onChange={() => {}}
                        className="w-5 h-5 rounded border-[#E2E8F0] text-[#3B82F6] focus:ring-[#3B82F6]"
                      />
                      <span className="font-medium">In Stock Only</span>
                    </label>
                    <label className="flex items-center gap-3 text-[#64748B] cursor-pointer hover:text-[#3B82F6] transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-[#E2E8F0] text-[#3B82F6] focus:ring-[#3B82F6]"
                      />
                      <span className="font-medium">On Sale</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                    Apply Filters
                  </button>
                  <button className="w-full py-3 border-2 border-[#E2E8F0] text-[#64748B] rounded-xl font-semibold hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all">
                    Clear All
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Enhanced Right Side - Product Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex items-center justify-between mb-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[#64748B]">Sort by:</span>
                <select className="px-4 py-2 border-2 border-[#E2E8F0] bg-[#F8FAFC] rounded-xl text-[#1E293B] font-semibold focus:border-[#3B82F6] focus:outline-none cursor-pointer transition-all hover:border-[#3B82F6]">
                  <option>Best Match</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Top Rated</option>
                  <option>Most Popular</option>
                </select>
              </div>
              <div className="text-sm text-[#64748B]">
                Showing <span className="font-bold text-[#1E293B]">1-{products.length}</span> of <span className="font-bold text-[#1E293B]">{products.length}</span>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border-2 border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-2xl hover:border-[#3B82F6] transition-all group relative"
                >
                  {/* Sale Badge */}
                  {product.oldPrice && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-[#DC2626] text-white text-sm font-bold rounded-lg shadow-lg">
                      SALE
                    </div>
                  )}

                  {/* Out of Stock Overlay */}
                  {!product.inStock && (
                    <div className="absolute top-1/3 left-0 right-0 bg-[#1E293B] bg-opacity-90 text-white text-center py-3 font-bold z-10">
                      Out of Stock
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#3B82F6] hover:text-white transition-all shadow-lg group/heart">
                    <Heart className="w-5 h-5" />
                  </button>

                  {/* Product Image */}
                  <Link href={`/product/${product.id}`}>
                    <div
                      className={`aspect-square ${
                        product.id % 5 === 1
                          ? "bg-gradient-to-br from-blue-200 to-indigo-300"
                          : product.id % 5 === 2
                          ? "bg-gradient-to-br from-purple-200 to-pink-300"
                          : product.id % 5 === 3
                          ? "bg-gradient-to-br from-green-200 to-emerald-300"
                          : product.id % 5 === 4
                          ? "bg-gradient-to-br from-orange-200 to-red-300"
                          : "bg-gradient-to-br from-cyan-200 to-blue-300"
                      } group-hover:scale-105 transition-transform duration-500 flex items-center justify-center`}
                    >
                      <ShoppingCart className="w-16 h-16 text-white opacity-30" />
                    </div>
                  </Link>

                  <div className="p-5">
                    {/* Brand */}
                    <p className="text-sm text-[#64748B] mb-1 font-medium">{product.brand}</p>

                    {/* Product Name */}
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-[#1E293B] mb-2 hover:text-[#3B82F6] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-[#E2E8F0]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#64748B] font-medium">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-2xl font-bold text-[#1E293B]">${product.price}</p>
                      {product.oldPrice && (
                        <span className="text-sm text-[#64748B] line-through">${product.oldPrice}</span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      disabled={!product.inStock}
                      className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        product.inStock
                          ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                          : "bg-[#E2E8F0] text-[#64748B] cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State (if no results) */}
            {products.length === 0 && (
              <div className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-16 text-center">
                <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-[#64748B]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1E293B] mb-3">No Products Found</h3>
                <p className="text-[#64748B] mb-8 max-w-md mx-auto">
                  We couldn't find any products matching your search. Try adjusting your filters or search term.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-all shadow-md"
                  >
                    Clear Filters
                  </button>
                  <Link
                    href="/category/all"
                    className="px-6 py-3 border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl font-semibold hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all"
                  >
                    Browse All
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button className="px-4 py-2 border-2 border-[#E2E8F0] rounded-xl hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#F8FAFC] transition-all font-semibold">
                  Previous
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                      page === 1
                        ? "bg-[#3B82F6] text-white shadow-md"
                        : "border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-4 py-2 border-2 border-[#E2E8F0] rounded-xl hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#F8FAFC] transition-all font-semibold">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
