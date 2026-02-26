"use client";

import { Link } from "../components/Link";
import { Search, ShoppingBag, User, X, Plus, Minus, Tag, Lock, CreditCard, Shield, Truck, Heart } from "lucide-react";
import * as React from "react";

export function ShoppingCartPage() {
  const [quantities, setQuantities] = React.useState([1, 1, 1]);
  const [couponCode, setCouponCode] = React.useState("");
  const [couponApplied, setCouponApplied] = React.useState(false);

  const products = [
    { name: "Premium Cotton T-Shirt", size: "M", color: "Blue", price: 29.99, inStock: true },
    { name: "Classic Denim Jeans", size: "L", color: "Dark Blue", price: 79.99, inStock: true },
    { name: "Leather Sneakers", size: "42", color: "White", price: 129.99, inStock: true }
  ];

  const subtotal = products.reduce((sum, product, idx) => sum + (product.price * quantities[idx]), 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal > 50 ? 0 : 10.00;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "save10") {
      setCouponApplied(true);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-2xl font-bold text-[#1E293B]">ShopHub</Link>
            <div className="flex items-center gap-6">
              <button className="text-[#1E293B] hover:text-[#3B82F6] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="text-[#1E293B] hover:text-[#3B82F6] transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <div className="relative text-[#1E293B]">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#3B82F6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
              </div>
              <Link href="/profile" className="text-[#1E293B] hover:text-[#3B82F6] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-3">Shopping Cart</h1>
          <p className="text-[#64748B]">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Banner */}
            {subtotal < 50 && (
              <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 flex-shrink-0" />
                  <p className="font-semibold">
                    Add <span className="font-bold">${(50 - subtotal).toFixed(2)}</span> more to get FREE shipping!
                  </p>
                </div>
              </div>
            )}

            {products.map((product, idx) => (
              <div key={idx} className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-6 hover:shadow-xl hover:border-[#3B82F6] transition-all">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 rounded-xl overflow-hidden shadow-md flex-shrink-0 border-2 border-[#E2E8F0]">
                    <div className={`w-full h-full ${
                      idx === 0 ? "bg-gradient-to-br from-blue-200 to-indigo-300" :
                      idx === 1 ? "bg-gradient-to-br from-indigo-200 to-purple-300" :
                      "bg-gradient-to-br from-purple-200 to-pink-300"
                    }`}></div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-[#1E293B] text-xl mb-2">{product.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-semibold text-[#64748B]">
                            Size: <span className="text-[#1E293B]">{product.size}</span>
                          </span>
                          <span className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-semibold text-[#64748B]">
                            Color: <span className="text-[#1E293B]">{product.color}</span>
                          </span>
                        </div>
                        {product.inStock && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] bg-[#16A34A] bg-opacity-10 px-2 py-1 rounded-lg">
                              <span className="w-2 h-2 bg-[#16A34A] rounded-full"></span>
                              In Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="text-[#64748B] hover:text-[#DC2626] hover:bg-[#DC2626] hover:bg-opacity-10 transition-all p-2 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantities(prev => {
                            const newQty = [...prev];
                            newQty[idx] = Math.max(1, newQty[idx] - 1);
                            return newQty;
                          })}
                          className="w-10 h-10 rounded-xl bg-[#F8FAFC] border-2 border-[#E2E8F0] flex items-center justify-center hover:border-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all font-bold shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-[#1E293B] font-bold text-xl w-12 text-center">{quantities[idx]}</span>
                        <button
                          onClick={() => setQuantities(prev => {
                            const newQty = [...prev];
                            newQty[idx] += 1;
                            return newQty;
                          })}
                          className="w-10 h-10 rounded-xl bg-[#F8FAFC] border-2 border-[#E2E8F0] flex items-center justify-center hover:border-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all font-bold shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#1E293B]">${(product.price * quantities[idx]).toFixed(2)}</p>
                        <p className="text-sm text-[#64748B]">${product.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/category/all"
              className="block w-full text-center py-4 border-2 border-[#E2E8F0] rounded-xl font-semibold text-[#64748B] hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#F8FAFC] transition-all bg-white shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-[#1E293B] mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-8 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="relative mb-3">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    disabled={couponApplied}
                    className={`w-full pl-12 pr-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all bg-white ${
                      couponApplied ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                {couponApplied ? (
                  <div className="bg-[#16A34A] bg-opacity-10 border border-[#16A34A] text-[#16A34A] py-2 px-4 rounded-lg font-semibold text-center">
                    ✓ Coupon Applied!
                  </div>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="w-full bg-[#1E293B] text-white py-3 rounded-xl font-semibold hover:bg-[#334155] transition-all shadow-md hover:shadow-lg"
                  >
                    Apply Coupon
                  </button>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-[#E2E8F0]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Subtotal</span>
                  <span className="font-bold text-[#1E293B]">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#16A34A] font-semibold">Discount (10%)</span>
                    <span className="font-bold text-[#16A34A]">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-bold text-[#16A34A]">FREE</span>
                  ) : (
                    <span className="font-bold text-[#1E293B]">${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tax</span>
                  <span className="font-bold text-[#1E293B]">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Savings Highlight */}
              {discount > 0 && (
                <div className="mb-6 p-4 bg-[#16A34A] bg-opacity-10 border border-[#16A34A] rounded-xl">
                  <p className="text-[#16A34A] font-bold text-center">
                    🎉 You're saving ${discount.toFixed(2)}!
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-baseline mb-8 p-5 bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] rounded-xl border-2 border-[#E2E8F0]">
                <span className="text-xl font-bold text-[#1E293B]">Total</span>
                <span className="text-3xl font-bold text-[#3B82F6]">${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full bg-[#3B82F6] text-white py-4 rounded-xl font-semibold hover:bg-[#2563EB] transition-all text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Secure Checkout
                </div>
              </Link>

              {/* Security Badges */}
              <div className="space-y-3 pt-6 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-3 text-sm text-[#64748B]">
                  <Shield className="w-5 h-5 text-[#16A34A]" />
                  <span>SSL Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#64748B]">
                  <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                  <span>Multiple Payment Options</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#64748B]">
                  <Truck className="w-5 h-5 text-[#F59E0B]" />
                  <span>Free Returns within 30 days</span>
                </div>
              </div>

              {/* Payment Icons */}
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <p className="text-xs text-[#64748B] text-center mb-3 font-semibold">We Accept</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <div className="w-12 h-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex items-center justify-center text-xs font-bold text-[#1E293B]">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex items-center justify-center text-xs font-bold text-[#1E293B]">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex items-center justify-center text-xs font-bold text-[#1E293B]">
                    AMEX
                  </div>
                  <div className="w-12 h-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex items-center justify-center text-xs font-bold text-[#1E293B]">
                    PAY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
