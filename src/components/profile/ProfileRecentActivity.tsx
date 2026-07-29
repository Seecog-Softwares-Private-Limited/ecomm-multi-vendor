"use client";

import { memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { formatProfileCurrency } from "@/lib/profile/profile-dashboard-utils";
import { getStatusCategory } from "@/lib/orders/order-list-utils";
import type { OrderListRow } from "@/components/orders/OrderListCard";

const STATUS_LABEL: Record<ReturnType<typeof getStatusCategory>, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type ProfileRecentActivityProps = {
  orders: OrderListRow[];
};

export const ProfileRecentActivity = memo(function ProfileRecentActivity({
  orders,
}: ProfileRecentActivityProps) {
  const recent = orders.slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section aria-label="Recent activity" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">Recent Activity</h2>
        <Link
          href="/my-orders"
          className="text-sm font-semibold text-[#FF6A00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        >
          See all orders
        </Link>
      </div>
      <ul className="divide-y divide-slate-100">
        {recent.map((order) => {
          const preview = order.previewItems[0];
          const category = getStatusCategory(order.status);
          const name = preview?.productName ?? `Order ${order.itemCount} items`;

          return (
            <li key={order.id}>
              <Link
                href={`/order-detail/${order.id}`}
                className="flex items-center gap-3 py-3 transition hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6A00]/30 sm:gap-4 sm:py-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-16">
                  {preview?.imageUrl ? (
                    <ProductImage
                      src={preview.imageUrl}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No img
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{STATUS_LABEL[category]}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {formatProfileCurrency(order.totalAmount)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
