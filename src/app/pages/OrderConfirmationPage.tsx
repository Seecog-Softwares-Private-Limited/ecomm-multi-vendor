import { Link } from "../components/Link";
import { Check, Package, Truck, Home } from "lucide-react";

export function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Check className="w-12 h-12 text-white stroke-[3]" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-[#111827] mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-2">Thank you for your purchase</p>
          <p className="text-sm text-gray-500 mb-12">
            Order ID: <span className="font-bold text-[#111827]">#ORDER-2026-1234</span>
          </p>

          {/* Order Details Card */}
          <div className="bg-[#F9FAFB] rounded-2xl p-8 mb-8 text-left border-2 border-gray-200">
            <h2 className="text-xl font-bold text-[#111827] mb-6">Order Details</h2>

            {/* Delivery Timeline */}
            <div className="space-y-6 mb-8">
              {[
                { icon: Check, title: "Order Confirmed", desc: "February 24, 2026", active: true, color: "bg-[#16A34A]" },
                { icon: Package, title: "Processing", desc: "We're preparing your order", active: true, color: "bg-[#2563EB]" },
                { icon: Truck, title: "Shipped", desc: "Expected in 2-3 business days", active: false, color: "bg-gray-300" },
                { icon: Home, title: "Delivered", desc: "Estimated: February 27, 2026", active: false, color: "bg-gray-300" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-lg mb-1 ${step.active ? "text-[#111827]" : "text-gray-400"}`}>
                      {step.title}
                    </p>
                    <p className={`text-sm ${step.active ? "text-gray-600" : "text-gray-400"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="font-bold text-[#111827] mb-3">Delivery Address</h3>
              <p className="text-gray-600">123 Main Street</p>
              <p className="text-gray-600">New York, NY 10001</p>
              <p className="text-gray-600">+1 234 567 8900</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#F9FAFB] rounded-2xl p-8 mb-8 text-left border-2 border-gray-200">
            <h2 className="text-xl font-bold text-[#111827] mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-200 to-indigo-300 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#111827] text-sm mb-1">Product {idx + 1}</p>
                    <p className="text-xs text-gray-600">Size: M • Qty: 1</p>
                    <p className="text-sm font-bold text-[#111827] mt-1">$29.99</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
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
              <div className="flex justify-between items-baseline pt-4 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-[#111827]">Total</span>
                <span className="text-2xl font-bold text-[#2563EB]">$273.97</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl">
              Track Your Order
            </button>
            <Link
              href="/home"
              className="block w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Email Confirmation */}
          <p className="mt-8 text-sm text-gray-600">
            A confirmation email has been sent to{" "}
            <span className="font-bold text-[#111827]">your@email.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
