"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Package, Truck, MapPin, XCircle } from "lucide-react";
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

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const CANCELLABLE_STATUSES = ["PLACED", "PAYMENT_CONFIRMED", "PROCESSING"] as const;

type CustomerOrderDetail = {
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
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  } | null;
  items: {
    id: string;
    productName: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
};

export function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

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
  const canCancel =
    order &&
    (CANCELLABLE_STATUSES as readonly string[]).includes(order.status);

  async function submitCancel() {
    if (!orderId.trim()) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "cancel",
          ...(cancelReason.trim() ? { reason: cancelReason.trim() } : {}),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { order: CustomerOrderDetail };
        error?: { message?: string };
      };
      if (!res.ok || !json?.success || !json.data?.order) {
        setCancelError(json?.error?.message ?? "Could not cancel this order.");
        return;
      }
      setOrder(json.data.order);
      setShowCancelModal(false);
      setCancelReason("");
    } catch {
      setCancelError("Something went wrong. Try again.");
    } finally {
      setCancelLoading(false);
    }
  }

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
          <div className="flex flex-wrap items-center gap-3">
            {canCancel && order && (
              <button
                type="button"
                onClick={() => {
                  setCancelError(null);
                  setShowCancelModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-700 bg-red-50 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel order
              </button>
            )}
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
        </div>

        {showCancelModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h2 id="cancel-order-title" className="text-lg font-bold text-slate-900">
                Cancel this order?
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                You can cancel before the order is shipped. If you already paid online, refunds are
                processed per our policy (may take a few business days).
              </p>
              <label className="block mt-4">
                <span className="text-sm font-medium text-slate-700">Reason (optional)</span>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Ordered by mistake"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                />
              </label>
              {cancelError && (
                <p className="text-sm text-red-600 mt-3" role="alert">
                  {cancelError}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2 mt-6">
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelError(null);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Keep order
                </button>
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={() => void submitCancel()}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling…" : "Yes, cancel order"}
                </button>
              </div>
            </div>
          </div>
        )}

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
              <p className="mt-2">
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
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
