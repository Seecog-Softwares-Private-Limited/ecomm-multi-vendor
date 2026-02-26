"use client";

import { Link } from "../components/Link";
import { Search, ShoppingBag, User, Check, Plus, CreditCard, Smartphone, Wallet } from "lucide-react";
import * as React from "react";

export function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = React.useState(0);
  const [selectedPayment, setSelectedPayment] = React.useState("card");

  const addresses = [
    { id: 0, name: "Home", address: "123 Main St, New York, NY 10001", phone: "+1 234 567 8900" },
    { id: 1, name: "Office", address: "456 Business Ave, New York, NY 10002", phone: "+1 234 567 8901" },
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="text-2xl font-bold text-[#111827]">ShopHub</Link>
            <div className="flex items-center gap-6">
              <Search className="w-5 h-5 text-[#111827]" />
              <div className="relative text-[#111827]">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#2563EB] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
              </div>
              <User className="w-5 h-5 text-[#111827]" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-semibold text-[#111827]">Cart</span>
            </div>
            <div className="w-20 h-1 bg-[#2563EB]"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold">
                2
              </div>
              <span className="font-semibold text-[#111827]">Checkout</span>
            </div>
            <div className="w-20 h-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-gray-600">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#111827]">Delivery Address</h2>
                <button className="flex items-center gap-2 text-[#2563EB] font-semibold hover:text-[#1D4ED8]">
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                      selectedAddress === addr.id
                        ? "border-[#2563EB] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-[#111827]">{addr.name}</span>
                          {addr.id === 0 && (
                            <span className="px-2 py-1 bg-[#2563EB] text-white text-xs rounded-lg font-semibold">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{addr.address}</p>
                        <p className="text-gray-600">{addr.phone}</p>
                      </div>
                      {selectedAddress === addr.id && (
                        <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#111827] mb-6">Payment Method</h2>

              <div className="space-y-4 mb-6">
                {[
                  { id: "card", icon: CreditCard, title: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
                  { id: "upi", icon: Smartphone, title: "UPI / Wallet", desc: "Google Pay, PhonePe, Paytm" },
                  { id: "cod", icon: Wallet, title: "Cash on Delivery", desc: "Pay when you receive" }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      selectedPayment === method.id
                        ? "border-[#2563EB] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] flex items-center justify-center">
                      <method.icon className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-[#111827]">{method.title}</p>
                      <p className="text-sm text-gray-600">{method.desc}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedPayment === "card" && (
                <div className="space-y-4 p-6 bg-[#F9FAFB] rounded-xl">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none bg-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none bg-white"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2563EB] focus:outline-none bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#111827] mb-6">Order Summary</h2>

              {/* Products */}
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-200 to-indigo-300 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#111827] text-sm mb-1">Product {idx + 1}</p>
                      <p className="text-xs text-gray-600">Size: M • Qty: 1</p>
                      <p className="text-sm font-bold text-[#111827] mt-1">$29.99</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-[#111827]">$239.97</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold text-[#111827]">$10.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-bold text-[#111827]">$24.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-8 p-4 bg-[#F9FAFB] rounded-xl">
                <span className="text-xl font-bold text-[#111827]">Total</span>
                <span className="text-3xl font-bold text-[#2563EB]">$273.97</span>
              </div>

              {/* Place Order Button */}
              <Link
                href="/order-confirmation"
                className="block w-full bg-[#2563EB] text-white py-4 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
              >
                Place Order
              </Link>

              <p className="text-xs text-center text-gray-600">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
