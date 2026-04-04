"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Package, Truck, Home } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";

type OrderDetail = {
  id: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  createdAt: string;
  address: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  } | null;
  items: Array<{
    id: string;
    productName: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load order");
      })
      .then((data) => {
        if (!cancelled && data?.data?.order) setOrder(data.data.order);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-[#6B7280] font-medium">Loading order details…</p>
      </div>
    );
  }

  const displayId = order?.id
    ? `#${order.id.slice(0, 8).toUpperCase()}`
    : "#ORDER-2026-1234";

  return (
    <div className="min-h-screen bg-[#F9FAFB]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <TopBar />
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-8 sm:p-12">
          <div className="w-20 h-20 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2 text-center">
            Order Confirmed!
          </h1>
          <p className="text-[#6B7280] text-center mb-2">
            Thank you for your purchase
          </p>
          <p className="text-sm text-[#6B7280] text-center mb-10">
            Order ID: <span className="font-bold text-[#111827]">{displayId}</span>
          </p>

          {error && (
            <p className="text-[#DC2626] text-center mb-6">
              Could not load order details. You can track it from My Orders.
            </p>
          )}

          {order && (
            <>
              <div className="bg-[#F9FAFB] rounded-xl p-6 mb-6 border border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827] mb-4">
                  Order Details
                </h2>
                <div className="space-y-4 mb-6">
                  {[
                    {
                      icon: Check,
                      title: "Order Confirmed",
                      desc: new Date(order.createdAt).toLocaleDateString("en-IN"),
                      active: true,
                      color: "bg-[#16A34A]",
                    },
                    {
                      icon: Package,
                      title: "Processing",
                      desc: "We're preparing your order",
                      active: true,
                      color: "bg-[#FF6A00]",
                    },
                    {
                      icon: Truck,
                      title: "Shipped",
                      desc: "Expected in 2-3 business days",
                      active: false,
                      color: "bg-[#E5E7EB]",
                    },
                    {
                      icon: Home,
                      title: "Delivered",
                      desc: "Estimated delivery",
                      active: false,
                      color: "bg-[#E5E7EB]",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center shrink-0`}
                      >
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-bold text-[15px] ${
                            step.active ? "text-[#111827]" : "text-[#9CA3AF]"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`text-sm ${
                            step.active ? "text-[#6B7280]" : "text-[#9CA3AF]"
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {order.address && (
                  <div className="border-t border-[#E5E7EB] pt-4">
                    <h3 className="font-bold text-[#111827] mb-2">
                      Delivery Address
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      {order.address.line1}
                      {order.address.line2 && `, ${order.address.line2}`}
                    </p>
                    <p className="text-[#6B7280] text-sm">
                      {order.address.city}, {order.address.state}{" "}
                      {order.address.pincode}
                    </p>
                    <p className="text-[#6B7280] text-sm">
                      {order.address.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-[#F9FAFB] rounded-xl p-6 mb-8 border border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827] mb-4">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#E5E7EB] border border-[#E5E7EB] shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full bg-[#D1D5DC]"
                            title={item.productName}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#111827] text-sm line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Qty: {item.quantity} × ₹
                          {item.unitPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm font-bold text-[#111827] mt-0.5">
                          ₹{item.totalPrice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                  {order.shippingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Shipping</span>
                      <span className="font-semibold text-[#111827]">
                        ₹{order.shippingAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Tax</span>
                    <span className="font-semibold text-[#111827]">
                      ₹{order.taxAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-[#E5E7EB]">
                    <span className="font-bold text-[#111827]">Total</span>
                    <span className="text-xl font-bold text-[#FF6A00]">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-3">
            <Link
              href={order ? `/track-order/${order.id}` : "/my-orders"}
              className="block w-full bg-[#FF6A00] text-white py-3.5 rounded-xl font-semibold text-center hover:bg-[#E55F00] transition"
            >
              {order ? "Track Your Order" : "My Orders"}
            </Link>
            <Link
              href="/"
              className="block w-full border-2 border-[#E5E7EB] text-[#374151] py-3.5 rounded-xl font-semibold text-center hover:border-[#FF6A00] hover:text-[#FF6A00] transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <p className="text-[#6B7280]">Loading…</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
