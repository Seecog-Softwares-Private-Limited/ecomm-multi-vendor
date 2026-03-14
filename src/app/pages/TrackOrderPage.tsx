"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Package, Truck, Check, Home, MapPin, ArrowLeft } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Order Placed",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function TrackOrderPage() {
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    address: { fullName: string; line1: string; line2?: string; city: string; state: string; pincode: string; phone: string } | null;
    items: { productName: string; quantity: number; totalPrice: number }[];
    timeline: { status: string; note: string | undefined; occurredAt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
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

  const displayId = order?.id ? `#${order.id.slice(0, 8).toUpperCase()}` : "";

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#FF6A00] font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">Loading order…</div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-red-600 font-medium mb-4">Could not load this order.</p>
            <Link href="/my-orders" className="text-[#FF6A00] font-semibold hover:underline">
              Back to My Orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Track Order</h1>
                <p className="text-slate-600 mt-1">Order {displayId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-800">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className="text-lg font-bold text-[#FF6A00]">
                  {formatRupee(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order timeline</h2>
              <div className="space-y-0">
                {(order.timeline && order.timeline.length > 0
                  ? order.timeline
                  : [{ status: order.status, note: "Order placed", occurredAt: order.createdAt }]
                ).map((event, idx) => {
                  const Icon = event.status === "DELIVERED" ? Home : event.status === "SHIPPED" || event.status === "OUT_FOR_DELIVERY" ? Truck : event.status === "PAYMENT_CONFIRMED" ? Check : Package;
                  const isLast = idx === (order.timeline?.length ?? 1) - 1;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#FF6A00] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 min-h-[24px] bg-slate-200 my-1" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-semibold text-slate-900">
                          {STATUS_LABEL[event.status] ?? event.status}
                        </p>
                        {event.note && (
                          <p className="text-sm text-slate-600">{event.note}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(event.occurredAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.address && (
              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF6A00]" />
                  Delivery address
                </h2>
                <p className="text-slate-700">
                  {order.address.fullName}, {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ""}
                </p>
                <p className="text-slate-700">
                  {order.address.city}, {order.address.state} {order.address.pincode}
                </p>
                <p className="text-slate-600 text-sm">{order.address.phone}</p>
              </div>
            )}

            {order.items && order.items.length > 0 && (
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Items</h2>
                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-slate-700">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatRupee(item.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </AccountLayout>
  );
}
