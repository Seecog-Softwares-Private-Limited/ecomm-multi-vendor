"use client";

import { Link } from "../components/Link";
import { Search, ShoppingBag, User, ChevronRight, Star, Heart, SlidersHorizontal } from "lucide-react";
import * as React from "react";
import type { ProductListItem } from "@/types/catalog";

export type CategoryListingPageProps = {
  categoryName: string;
  categorySlug: string;
  products: ProductListItem[];
};

export function CategoryListingPage({ categoryName, categorySlug, products }: CategoryListingPageProps) {
  const [priceRange, setPriceRange] = React.useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);

  const brands = ["Nike", "Adidas", "Puma", "Under Armour", "New Balance"];
  const colors = [
    { name: "Black", class: "bg-gray-900" },
    { name: "White", class: "bg-white border-2 border-gray-300" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Red", class: "bg-red-500" },
    { name: "Green", class: "bg-green-500" },
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
              <User className="w-5 h-5 text-[#111827] hover:text-[#2563EB] cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Category Banner */}
      <div className="relative h-[250px] bg-gradient-to-r from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">{categoryName}</h1>
          <p className="text-xl">Discover the latest trends and styles</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#2563EB]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#111827] font-semibold">{categoryName}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 pb-20">
        <div className="flex gap-8">
          {/* Sticky Filter Sidebar */}
          <aside className="hidden lg:block w-80 sticky top-24 self-start">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#111827]">Filters</h3>
                <button className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-semibold">Clear all</button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-bold text-[#111827] mb-4">Price Range</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#2563EB]"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">${priceRange[0]}</span>
                    <span className="text-[#111827] font-bold">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-8">
                <h4 className="font-bold text-[#111827] mb-4">Brands</h4>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => {
                          setSelectedBrands(prev =>
                            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                          );
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="text-gray-700 group-hover:text-[#111827]">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h4 className="font-bold text-[#111827] mb-4">Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(color.name) ? prev.filter(c => c !== color.name) : [...prev, color.name]
                        );
                      }}
                      className={`w-10 h-10 rounded-lg ${color.class} ${
                        selectedColors.includes(color.name) ? "ring-4 ring-[#2563EB] ring-offset-2" : ""
                      } shadow-md hover:scale-110 transition-all`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-bold text-[#111827] mb-4">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      className="flex items-center gap-2 w-full py-2 hover:bg-[#F9FAFB] rounded-lg transition-colors px-2"
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
              <p className="text-gray-600">
                Showing <span className="font-bold text-[#111827]">{products.length}</span> products
              </p>
              <div className="flex items-center gap-4">
                <button className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#2563EB] bg-white font-semibold">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] bg-white font-semibold">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <p className="text-gray-600 font-medium">No products in this category yet.</p>
                  <Link href="/" className="mt-4 inline-block text-[#2563EB] font-semibold hover:underline">
                    Browse all categories
                  </Link>
                </div>
              ) : products.map((product, idx) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug ?? product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <div
                      className={`absolute inset-0 ${
                        idx % 4 === 0 ? "bg-gradient-to-br from-blue-200 to-indigo-300" :
                        idx % 4 === 1 ? "bg-gradient-to-br from-purple-200 to-pink-300" :
                        idx % 4 === 2 ? "bg-gradient-to-br from-green-200 to-emerald-300" :
                        "bg-gradient-to-br from-orange-200 to-red-300"
                      } group-hover:scale-110 transition-transform duration-500 flex items-center justify-center bg-cover bg-center`}
                      style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}
                    />
                    <button className="absolute top-4 right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#DC2626] hover:text-white transition-colors shadow-lg z-10">
                      <Heart className="w-5 h-5" />
                    </button>
                    {product.oldPrice != null && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-[#DC2626] text-white text-sm font-bold rounded-lg">
                        Sale
                      </div>
                    )}
                    <button className="absolute bottom-4 left-4 right-4 bg-[#111827] text-white py-3 rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all font-semibold hover:bg-[#2563EB]">
                      Quick Add
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">({product.reviews})</span>
                    </div>
                    <h3 className="font-semibold text-[#111827] mb-2 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-[#111827]">${product.price.toFixed(2)}</p>
                      {product.oldPrice != null && (
                        <span className="text-sm text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
              <button className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#2563EB] hover:text-[#2563EB] font-semibold bg-white">
                Previous
              </button>
              <button className="px-4 py-2 bg-[#2563EB] text-white rounded-xl font-semibold">1</button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#2563EB] hover:text-[#2563EB] font-semibold bg-white">2</button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#2563EB] hover:text-[#2563EB] font-semibold bg-white">3</button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#2563EB] hover:text-[#2563EB] font-semibold bg-white">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
