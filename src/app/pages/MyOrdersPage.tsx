"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountLayout } from "@/components/AccountLayout";

type OrderRow = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
};

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  DELIVERED: { label: "Delivered", className: "bg-emerald-600 text-white" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", className: "bg-blue-600 text-white" },
  SHIPPED: { label: "Shipped", className: "bg-blue-500 text-white" },
  PROCESSING: { label: "Processing", className: "bg-amber-500 text-white" },
  PAYMENT_CONFIRMED: { label: "Payment Confirmed", className: "bg-teal-600 text-white" },
  PLACED: { label: "Placed", className: "bg-slate-600 text-white" },
  CANCELLED: { label: "Cancelled", className: "bg-red-600 text-white" },
  RETURNED: { label: "Returned", className: "bg-slate-500 text-white" },
};

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        if (!cancelled && data?.data?.orders) setOrders(data.data.orders);
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
  }, []);

  const displayOrderId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;
  const canTrack = (status: string) =>
    !["DELIVERED", "CANCELLED", "RETURNED"].includes(status);

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">
            Loading orders…
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-600 font-medium">
            Failed to load orders. Please try again.
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="py-12 text-center text-slate-600">
            <p className="font-medium">You have no orders yet.</p>
            <Link
              href="/"
              className="inline-block mt-4 text-[#FF6A00] font-semibold hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_DISPLAY[order.status] ?? {
                label: order.status,
                className: "bg-slate-500 text-white",
              };
              return (
                <div
                  key={order.id}
                  className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-0.5">Order ID</p>
                      <p className="font-bold text-slate-900">{displayOrderId(order.id)}</p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Date</p>
                      <p className="font-medium text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Items</p>
                      <p className="font-medium text-slate-800">
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Total</p>
                      <p className="font-bold text-[#FF6A00]">
                        {formatRupee(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/order-detail/${order.id}`}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors"
                    >
                      View Details
                    </Link>
                    {canTrack(order.status) && (
                      <Link
                        href={`/track-order/${order.id}`}
                        className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-[#FF6A00] text-[#FF6A00] rounded-xl font-semibold hover:bg-[#FF6A00] hover:text-white transition-colors"
                      >
                        Track Order
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
