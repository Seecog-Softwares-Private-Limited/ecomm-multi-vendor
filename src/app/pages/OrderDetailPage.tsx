"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Package, Truck, MapPin } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

export function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    createdAt: string;
    address: { fullName: string; line1: string; line2?: string; city: string; state: string; pincode: string; phone: string } | null;
    items: { id: string; productName: string; imageUrl: string | null; quantity: number; unitPrice: number; totalPrice: number }[];
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
  const canTrack = order && !["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status);

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/my-orders"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#FF6A00] font-medium transition-colors"
          >
            ← Back to My Orders
          </Link>
          {canTrack && order && (
            <Link
              href={`/track-order/${order.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </Link>
          )}
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">
            Loading order…
          </div>
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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
              <p className="text-slate-600 mt-1">
                {displayId} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
              <p className="mt-2 text-lg font-bold text-[#FF6A00]">
                {formatRupee(order.totalAmount)}
              </p>
            </div>

            {order.address && (
              <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100">
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

            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FF6A00]" />
                Items
              </h2>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <img
                    src={item.imageUrl || PLACEHOLDER_IMAGE}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.productName}</p>
                    <p className="text-sm text-slate-600">
                      Qty: {item.quantity} × {formatRupee(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900 shrink-0">
                    {formatRupee(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span>-{formatRupee(order.discountAmount)}</span>
                </div>
              )}
              {order.shippingAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatRupee(order.shippingAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatRupee(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2">
                <span>Total</span>
                <span className="text-[#FF6A00]">{formatRupee(order.totalAmount)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </AccountLayout>
  );
}
