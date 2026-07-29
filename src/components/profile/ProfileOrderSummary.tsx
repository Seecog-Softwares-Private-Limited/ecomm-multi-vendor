"use client";

import { memo } from "react";
import Link from "next/link";
import type { OrderFilter } from "@/lib/orders/order-list-utils";

type OrderSummaryCounts = {
  pending: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

type ProfileOrderSummaryProps = {
  counts: OrderSummaryCounts;
};

const SUMMARY_ITEMS: { key: OrderFilter; label: string; color: string }[] = [
  { key: "pending", label: "Pending", color: "text-amber-700 bg-amber-50 border-amber-100" },
  { key: "shipped", label: "Shipped", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { key: "delivered", label: "Delivered", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { key: "cancelled", label: "Cancelled", color: "text-slate-600 bg-slate-50 border-slate-200" },
];

export const ProfileOrderSummary = memo(function ProfileOrderSummary({
  counts,
}: ProfileOrderSummaryProps) {
  const total = counts.pending + counts.shipped + counts.delivered + counts.cancelled;
  if (total === 0) return null;

  return (
    <section aria-label="Order summary" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">Order Summary</h2>
        <Link
          href="/my-orders"
          className="text-sm font-semibold text-[#FF6A00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUMMARY_ITEMS.map(({ key, label, color }) => (
          <Link
            key={key}
            href={`/my-orders?status=${key}`}
            className={`rounded-xl border p-4 text-center transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 ${color}`}
          >
            <p className="text-2xl font-bold">{counts[key]}</p>
            <p className="mt-1 text-xs font-semibold sm:text-sm">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
});
