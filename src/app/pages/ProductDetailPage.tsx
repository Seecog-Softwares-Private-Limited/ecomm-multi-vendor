"use client";

import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Heart, Share2, Star, Plus, Minus, Truck, RefreshCw, Shield, ChevronDown } from "lucide-react";
import * as React from "react";

export function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState("M");
  const [selectedColor, setSelectedColor] = React.useState("Blue");
  const [quantity, setQuantity] = React.useState(1);

  const images = [0, 1, 2, 3, 4];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Blue", class: "bg-blue-500" },
    { name: "Black", class: "bg-gray-900" },
    { name: "Red", class: "bg-red-500" },
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-2xl font-bold text-[#111827]">ShopHub</Link>
            <div className="flex items-center gap-6">
              <Search className="w-5 h-5 text-[#111827] cursor-pointer hover:text-[#2563EB] transition-colors" />
              <Link href="/cart" className="relative text-[#111827] hover:text-[#2563EB] transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#2563EB] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
              </Link>
              <User className="w-5 h-5 text-[#111827] cursor-pointer hover:text-[#2563EB] transition-colors" />
            </div>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300"></div>
              
              <button className="absolute top-6 right-6 bg-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#DC2626] hover:text-white transition-all shadow-lg">
                <Heart className="w-6 h-6" />
              </button>

              <div className="absolute top-6 left-6 px-4 py-2 bg-[#DC2626] text-white text-sm font-bold rounded-lg">
                25% OFF
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all shadow-md ${
                    selectedImage === idx ? "ring-4 ring-[#2563EB]" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-300"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-4xl font-bold text-[#111827] mb-4">
                Premium Cotton T-Shirt
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-[#111827] font-semibold">4.8</span>
                <span className="text-gray-600">(324 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8 p-6 bg-[#F9FAFB] rounded-xl">
                <span className="text-4xl font-bold text-[#111827]">$29.99</span>
                <span className="text-2xl text-gray-400 line-through">$39.99</span>
                <span className="px-3 py-1 bg-[#16A34A] text-white text-sm font-bold rounded-lg">SAVE 25%</span>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#111827] mb-3">
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-12 h-12 rounded-lg ${color.class} ${
                        selectedColor === color.name ? "ring-4 ring-[#2563EB] ring-offset-2" : ""
                      } transition-all shadow-md hover:scale-110`}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#111827] mb-3">
                  Size: <span className="font-normal text-gray-600">{selectedSize}</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        selectedSize === size
                          ? "bg-[#2563EB] text-white shadow-lg"
                          : "bg-[#F9FAFB] border-2 border-gray-200 hover:border-[#2563EB] text-[#111827]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#111827] mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-[#2563EB] hover:text-[#2563EB] transition-all bg-white"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-[#111827] w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-[#2563EB] hover:text-[#2563EB] transition-all bg-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4 mb-8">
                <Link
                  href="/cart"
                  className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Link>
                <button className="w-full border-2 border-[#111827] text-[#111827] py-4 rounded-xl font-semibold hover:bg-[#111827] hover:text-white transition-all">
                  Buy Now
                </button>
                <button className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-all bg-white flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4 border-t-2 border-gray-200 pt-6">
                {[
                  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
                  { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
                  { icon: Shield, title: "Secure Payment", desc: "100% secure transactions" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F9FAFB] rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Accordion */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="max-w-3xl">
            {["Description", "Specifications", "Shipping & Returns"].map((section, idx) => (
              <details key={idx} className="group border-b border-gray-200 last:border-0">
                <summary className="flex items-center justify-between py-6 cursor-pointer list-none">
                  <span className="text-lg font-bold text-[#111827]">{section}</span>
                  <ChevronDown className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pb-6 text-gray-600">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#111827] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                <div className="relative aspect-square bg-gradient-to-br from-purple-200 to-pink-300 group-hover:scale-105 transition-transform duration-500"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#111827] mb-2">Related Product {item}</h3>
                  <p className="text-xl font-bold text-[#111827]">$49.99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
