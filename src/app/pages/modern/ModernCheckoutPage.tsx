"use client";

import { Link } from "../../components/Link";
import { Search, ShoppingBag, User, Check, Plus, CreditCard, Smartphone } from "lucide-react";
import * as React from "react";

export function ModernCheckoutPage() {
  const [selectedAddress, setSelectedAddress] = React.useState(0);
  const [selectedPayment, setSelectedPayment] = React.useState("card");

  const addresses = [
    { id: 0, name: "Home", address: "123 Main St, New York, NY 10001", phone: "+1 234 567 8900" },
    { id: 1, name: "Office", address: "456 Business Ave, New York, NY 10002", phone: "+1 234 567 8901" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/modern" className="text-2xl font-bold text-gray-900">LUXE</Link>
            <div className="flex items-center gap-6">
              <Search className="w-5 h-5 text-gray-900 cursor-pointer" />
              <div className="relative cursor-pointer">
                <ShoppingBag className="w-5 h-5 text-gray-900" />
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </div>
              <User className="w-5 h-5 text-gray-900 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-900">Cart</span>
            </div>
            <div className="w-20 h-0.5 bg-gray-900"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium">
                2
              </div>
              <span className="font-medium text-gray-900">Checkout</span>
            </div>
            <div className="w-20 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium">
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
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                <button className="flex items-center gap-2 text-gray-900 font-medium hover:text-gray-600">
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
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{addr.name}</span>
                          {addr.id === 0 && (
                            <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{addr.address}</p>
                        <p className="text-gray-600">{addr.phone}</p>
                      </div>
                      {selectedAddress === addr.id && (
                        <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => setSelectedPayment("card")}
                  className={`w-full p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedPayment === "card"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Credit / Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                  {selectedPayment === "card" && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedPayment("upi")}
                  className={`w-full p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedPayment === "upi"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">UPI / Wallet</p>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                  </div>
                  {selectedPayment === "upi" && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedPayment("cod")}
                  className={`w-full p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedPayment === "cod"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">💵</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                  {selectedPayment === "cod" && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </div>

              {selectedPayment === "card" && (
                <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Products */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm mb-1">Premium Cotton Tee</p>
                      <p className="text-xs text-gray-600">Size: M • Qty: 1</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">$89.00</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">$267.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">$10.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">$27.70</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="text-xl font-semibold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-gray-900">$304.70</span>
              </div>

              {/* Place Order Button */}
              <Link
                href="/modern/order-confirmation"
                className="block w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors text-center shadow-lg mb-4"
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
