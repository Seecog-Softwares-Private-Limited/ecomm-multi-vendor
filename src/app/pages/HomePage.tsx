"use client";

import { Link } from "../components/Link";
import { Search, ShoppingBag, User, ChevronRight, Star, Heart, TrendingUp, Zap, Shield, Truck } from "lucide-react";
import * as React from "react";
import type { CategoryItem, ProductListItem } from "@/types/catalog";

export type HomePageProps = {
  categories: CategoryItem[];
  products: ProductListItem[];
};

export function HomePage({ categories, products }: HomePageProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/home" className="text-2xl font-bold text-[#0B1220]">
              ShopHub
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
                Men
              </Link>
              <Link href="#" className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
                Women
              </Link>
              <Link href="#" className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
                Kids
              </Link>
              <Link href="#" className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
                Collections
              </Link>
              <Link href="#" className="text-sm font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors">
                Sale
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-6">
              <button className="text-[#0F172A] hover:text-[#2563EB] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="text-[#0F172A] hover:text-[#2563EB] transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative text-[#0F172A] hover:text-[#2563EB] transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#2563EB] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </Link>
              <Link href="/profile" className="text-[#0F172A] hover:text-[#2563EB] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#1e293b] to-[#2563EB] opacity-95"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect Style
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Shop the latest trends from premium brands. Free shipping on orders over $50.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/category/all"
              className="px-8 py-4 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              href="#featured"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Explore More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#2563EB]/10 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-1">Free Shipping</h3>
              <p className="text-sm text-[#64748B]">On orders over $50</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#16A34A]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-1">Secure Payment</h3>
              <p className="text-sm text-[#64748B]">100% protected transactions</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#DC2626]/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-1">Flash Deals</h3>
              <p className="text-sm text-[#64748B]">Daily exclusive offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#0B1220]">Shop by Category</h2>
          <Link href="/category/all" className="flex items-center gap-2 text-[#2563EB] font-semibold hover:gap-3 transition-all">
            View All
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color ?? "from-gray-500 to-gray-600"} rounded-xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                  {category.icon ?? "📦"}
                </div>
                <h3 className="font-semibold text-[#0F172A]">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0B1220] mb-2">Featured Products</h2>
            <p className="text-[#64748B]">Handpicked items just for you</p>
          </div>
          <Link href="/category/featured" className="flex items-center gap-2 text-[#2563EB] font-semibold hover:gap-3 transition-all">
            View All
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2 group relative">
              {/* Sale Badge */}
              {product.oldPrice && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#DC2626] text-white text-sm font-bold rounded-lg shadow-lg">
                  SALE
                </div>
              )}

              {/* Wishlist Button */}
              <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#2563EB] hover:text-white transition-all shadow-md">
                <Heart className="w-5 h-5" />
              </button>

              {/* Product Image */}
              <Link href={`/product/${product.id}`}>
                <div
                  className={`aspect-square ${
                    index % 4 === 1
                      ? "bg-gradient-to-br from-blue-200 to-indigo-300"
                      : index % 4 === 2
                      ? "bg-gradient-to-br from-purple-200 to-pink-300"
                      : index % 4 === 3
                      ? "bg-gradient-to-br from-green-200 to-emerald-300"
                      : "bg-gradient-to-br from-orange-200 to-red-300"
                  } group-hover:scale-105 transition-transform duration-500 flex items-center justify-center bg-cover bg-center`}
                  style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}
                ></div>
              </Link>

              <div className="p-5">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-[#64748B] ml-1">({product.reviews})</span>
                </div>

                {/* Product Name */}
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-bold text-[#0F172A] mb-3 hover:text-[#2563EB] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-2xl font-bold text-[#0B1220]">${product.price}</p>
                  {product.oldPrice && (
                    <span className="text-sm text-[#64748B] line-through">${product.oldPrice}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-12 text-center shadow-xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold mb-4">
              <TrendingUp className="w-4 h-4" />
              Limited Time Offer
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Get 30% Off Your First Order</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Sign up today and receive an exclusive discount on your first purchase
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-[#2563EB] rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <h2 className="text-3xl font-bold text-[#0B1220] mb-3">Stay in the Loop</h2>
          <p className="text-[#64748B] mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new arrivals, and style tips
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 border-2 border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors text-[#0F172A] bg-[#F5F7FA]"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1220] text-white mt-12">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ShopHub</h3>
              <p className="text-white/70 text-sm">
                Your trusted destination for premium products and exceptional service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="#" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Sale</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Gift Cards</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="/support-tickets" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                <li><Link href="/my-orders" className="hover:text-white transition-colors">Order History</Link></li>
                <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
                <li><Link href="/address-management" className="hover:text-white transition-colors">Addresses</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex items-center justify-between">
            <p className="text-sm text-white/70">© 2026 ShopHub. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
