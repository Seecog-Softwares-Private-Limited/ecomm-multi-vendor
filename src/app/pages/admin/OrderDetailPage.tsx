"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Store,
  ChevronRight,
} from "lucide-react";

type OrderDetailApi = {
  id: string;
  status: string;
  statusDisplay: string;
  createdAt: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  customer: { id?: string; name: string; email: string; phone: string };
  shippingAddress: {
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
    productId: string;
    productName: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    seller: { id: string; businessName: string; email: string } | null;
  }>;
  payment: {
    mode: string;
    modeDisplay: string;
    status: string;
    statusDisplay: string;
    amount: number;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
  timeline: Array<{
    status: string;
    statusDisplay: string;
    note: string | null;
    occurredAt: string;
  }>;
};

export type OrderDetailPageProps = {
  orderId?: string;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

function formatRupee(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const orderStatusStyles: Record<string, string> = {
  Placed: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
  "Payment confirmed": "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Processing: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  Shipped: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200",
  "Out for delivery": "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
  Delivered: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
  Returned: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
};

const paymentStatusStyles: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Failed: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
  Refunded: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

export function OrderDetailPage({ orderId = "" }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetailApi | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Failed to load order.");
        setOrder(null);
        return;
      }
      if (json?.success && json?.data?.order) {
        setOrder(json.data.order);
      } else {
        setError("Order not found.");
        setOrder(null);
      }
    } catch {
      setError("Failed to load order.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-24 shadow-lg shadow-slate-200/50">
            <p className="text-slate-500 font-medium">Loading order details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const shortId = order.id.slice(0, 8);
  const orderStatusClass = orderStatusStyles[order.statusDisplay] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  const paymentStatusClass = paymentStatusStyles[order.payment?.statusDisplay ?? ""] ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Order Details
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Order ID: #{shortId}
              <span className="ml-2 font-mono text-slate-400">{order.id}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-xl px-3.5 py-1.5 text-sm font-semibold ring-1 ${orderStatusClass}`}
            >
              {order.statusDisplay}
            </span>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
            >
              Override Status
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Order summary, customer, sellers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Package className="h-5 w-5 text-slate-500" />
                  Order Summary
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Product
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Qty
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Price
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <tr key={item.id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                              <img
                                src={item.imageUrl || PLACEHOLDER_IMAGE}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.productName}</p>
                              {item.seller && (
                                <p className="text-xs text-slate-500">{item.seller.businessName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {formatRupee(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                          {formatRupee(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <User className="h-5 w-5 text-slate-500" />
                Customer Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</p>
                  <p className="mt-1 font-medium text-slate-900">{order.customer.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</p>
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="mt-1 block font-medium text-amber-600 hover:text-amber-700"
                  >
                    {order.customer.email || "—"}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Phone</p>
                  <p className="mt-1 font-medium text-slate-900">{order.customer.phone || "—"}</p>
                </div>
              </div>
            </div>

            {/* Sellers (unique from items) */}
            {(() => {
              const sellerMap = new Map<string, { id: string; businessName: string; email: string }>();
              for (const i of order.items) {
                if (i.seller?.id) sellerMap.set(i.seller.id, i.seller);
              }
              const sellers = Array.from(sellerMap.values());
              if (sellers.length === 0) return null;
              return (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Store className="h-5 w-5 text-slate-500" />
                    Seller{sellers.length > 1 ? "s" : ""}
                  </h2>
                  <ul className="space-y-3">
                    {sellers.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{s.businessName}</p>
                          <p className="text-sm text-slate-500">{s.email}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>

          {/* Right: Payment, address, timeline */}
          <div className="space-y-6">
            {/* Payment Info */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                  Payment Info
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatRupee(order.items.reduce((s, i) => s + i.totalPrice, 0))}
                  </span>
                </div>
                {order.shippingAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium text-slate-900">{formatRupee(order.shippingAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-medium text-slate-900">{formatRupee(order.taxAmount)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium text-emerald-600">-{formatRupee(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-slate-900">{formatRupee(order.totalAmount)}</span>
                </div>
                {order.payment && (
                  <>
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Payment Method
                      </p>
                      <p className="mt-1 font-medium text-slate-900">{order.payment.modeDisplay}</p>
                      {order.payment.transactionId && (
                        <p className="mt-0.5 text-xs text-slate-500 font-mono">
                          {order.payment.transactionId}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Payment Status
                      </p>
                      <span
                        className={`mt-1.5 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${paymentStatusClass}`}
                      >
                        {order.payment.statusDisplay}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  Shipping Address
                </h2>
                <div className="text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Clock className="h-5 w-5 text-slate-500" />
                Order Timeline
              </h2>
              <div className="relative space-y-0">
                {order.timeline.length === 0 ? (
                  <p className="text-sm text-slate-500">No events yet.</p>
                ) : (
                  order.timeline.map((event, index) => (
                    <div key={event.occurredAt + event.status} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 ring-2 ring-amber-200">
                          <div className="h-2 w-2 rounded-full bg-amber-600" />
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className="mt-1 w-0.5 flex-1 bg-slate-200 min-h-[24px]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-medium text-slate-900">{event.statusDisplay}</p>
                        {event.note && (
                          <p className="text-sm text-slate-500 mt-0.5">{event.note}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{formatDate(event.occurredAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
