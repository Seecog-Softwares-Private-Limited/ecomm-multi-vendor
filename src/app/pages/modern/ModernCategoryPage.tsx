"use client";

import { Link } from "../../../components/Link";
import { Search, ShoppingBag, User, ChevronRight, ChevronDown, X, Star, Heart, SlidersHorizontal } from "lucide-react";
import * as React from "react";

export function ModernCategoryPage() {
  const [priceRange, setPriceRange] = React.useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);

  const brands = ["Nike", "Adidas", "Puma", "Under Armour", "New Balance"];
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Red", hex: "#EF4444" },
    { name: "Green", hex: "#10B981" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/modern" className="text-2xl font-bold text-gray-900">
              LUXE
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-medium text-gray-900 hover:text-gray-600">Men</Link>
              <Link href="#" className="text-sm font-medium text-gray-900 hover:text-gray-600">Women</Link>
              <Link href="#" className="text-sm font-medium text-gray-900 hover:text-gray-600">New</Link>
              <Link href="#" className="text-sm font-medium text-gray-900 hover:text-gray-600">Collections</Link>
              <Link href="#" className="text-sm font-medium text-red-600">Sale</Link>
            </nav>
            <div className="flex items-center gap-6">
              <button className="text-gray-900"><Search className="w-5 h-5" /></button>
              <button className="relative text-gray-900">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              <Link href="/modern/login" className="text-gray-900"><User className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </header>

      {/* Category Banner */}
      <div className="relative h-[300px] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Men's Collection</h1>
          <p className="text-xl text-gray-300">Discover premium essentials for the modern man</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/modern" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Men</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 pb-24">
        <div className="flex gap-8">
          {/* Sticky Filter Sidebar */}
          <aside className="hidden lg:block w-80 sticky top-24 self-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button className="text-sm text-gray-600 hover:text-gray-900">Clear all</button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">${priceRange[0]}</span>
                    <span className="text-gray-900 font-medium">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Brands</h4>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => {
                          setSelectedBrands(prev =>
                            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                          );
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-0"
                      />
                      <span className="text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(color.name) ? prev.filter(c => c !== color.name) : [...prev, color.name]
                        );
                      }}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColors.includes(color.name) ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      className="flex items-center gap-2 w-full py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? "fill-gray-900 text-gray-900" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">& up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600">Showing <span className="font-medium text-gray-900">48</span> products</p>
              <div className="flex items-center gap-4">
                <button className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(12)].map((_, idx) => (
                <Link
                  key={idx}
                  href={`/modern/product/${idx + 1}`}
                  className="group"
                >
                  <div className="relative mb-4 rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4]">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-110 transition-transform duration-700"></div>
                    <button className="absolute top-4 right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors z-10">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="absolute bottom-4 left-4 right-4 bg-gray-900 text-white py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Quick Add
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">Premium Cotton Shirt</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-gray-900 text-gray-900" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">(89)</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">$129.00</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
