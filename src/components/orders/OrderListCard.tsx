"use client";

import { memo } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import {
  displayOrderId,
  getStatusCategory,
} from "@/lib/orders/order-list-utils";

export type OrderPreviewItem = {
  productId: string;
  productName: string;
  productSlug: string | null;
  imageUrl: string;
  quantity: number;
  variantKey: string | null;
};

export type OrderListRow = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  previewItems: OrderPreviewItem[];
};

type StatusCategory = ReturnType<typeof getStatusCategory>;

const STATUS_STYLES: Record<
  StatusCategory,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-900 border border-amber-200",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-900 border border-blue-200",
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-100 text-purple-900 border border-purple-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-900 border border-red-200",
  },
};

const ACTION_LINK_CLASS =
  "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:ring-offset-2";

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatOrderSummary(itemCount: number, totalAmount: number) {
  const label = `${itemCount} Item${itemCount !== 1 ? "s" : ""}`;
  return `${label} • ${formatRupee(totalAmount)}`;
}

function formatVariantLabel(variantKey: string | null): string | null {
  if (!variantKey) return null;
  const parts = variantKey.split("|").map((part) => {
    const [label, value] = part.split(":");
    if (!value) return null;
    const name = (label ?? "Option").replace(/^Color$/i, "Color").replace(/^Size$/i, "Size");
    return `${name}: ${value}`;
  });
  const filtered = parts.filter(Boolean);
  return filtered.length > 0 ? filtered.join(" · ") : null;
}

function productHref(item: OrderPreviewItem) {
  return `/product/${item.productSlug ?? item.productId}`;
}

const OrderThumbnails = memo(function OrderThumbnails({
  items,
}: {
  items: OrderPreviewItem[];
}) {
  if (items.length === 0) {
    return (
      <div
        className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500"
        aria-hidden="true"
      >
        No image
      </div>
    );
  }

  if (items.length === 1) {
    const item = items[0]!;
    return (
      <Link
        href={productHref(item)}
        className="relative block h-[90px] w-[90px] shrink-0 overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
        aria-label={`View ${item.productName}`}
      >
        <ProductImage
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </Link>
    );
  }

  return (
    <div className="relative h-[90px] w-[90px] shrink-0" aria-hidden="true">
      {items.slice(0, 3).map((item, index) => (
        <Link
          key={`${item.productId}-${index}`}
          href={productHref(item)}
          tabIndex={-1}
          className="absolute overflow-hidden rounded-lg border-2 border-white bg-slate-100 shadow-sm"
          style={{
            width: 52,
            height: 52,
            top: index * 10,
            left: index * 10,
            zIndex: 3 - index,
          }}
        >
          <ProductImage
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
      ))}
    </div>
  );
});

export const OrderListCard = memo(function OrderListCard({
  order,
}: {
  order: OrderListRow;
}) {
  const category = getStatusCategory(order.status);
  const statusInfo = STATUS_STYLES[category];
  const primary = order.previewItems[0];
  const variantLabel = primary ? formatVariantLabel(primary.variantKey) : null;
  const remainingCount = Math.max(0, order.itemCount - order.previewItems.length);
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const statusLabel =
    category === "shipped" && order.status === "OUT_FOR_DELIVERY"
      ? "Out for Delivery"
      : statusInfo.label;

  return (
    <article
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
      aria-label={`Order ${displayOrderId(order.id)}, ${statusLabel}`}
    >
      <div className="flex gap-4">
        <OrderThumbnails items={order.previewItems} />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {primary ? (
                <Link
                  href={productHref(primary)}
                  className="group block rounded focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                >
                  <h2 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-[#FF6A00]">
                    {primary.productName}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-base font-semibold text-slate-900">Order items</h2>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
            >
              {statusLabel}
            </span>
          </div>

          {variantLabel && (
            <p className="mb-1 text-sm text-slate-600">{variantLabel}</p>
          )}

          {primary && order.itemCount === 1 && (
            <p className="mb-1 text-sm text-slate-500">Qty: {primary.quantity}</p>
          )}

          {order.itemCount > 1 && remainingCount > 0 && (
            <p className="mb-1 text-sm font-medium text-[#FF6A00]">+{remainingCount} more</p>
          )}

          <p className="text-base font-bold text-slate-900">
            {formatOrderSummary(order.itemCount, order.totalAmount)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
            <time dateTime={order.createdAt}>{orderDate}</time>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-slate-500">{displayOrderId(order.id)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {(category === "pending" || category === "processing") && (
          <Link
            href={`/order-detail/${order.id}`}
            className={`${ACTION_LINK_CLASS} bg-[#FF6A00] text-white hover:bg-[#E55F00]`}
          >
            View Details
          </Link>
        )}

        {category === "shipped" && (
          <Link
            href={`/track-order/${order.id}`}
            className={`${ACTION_LINK_CLASS} bg-[#FF6A00] text-white hover:bg-[#E55F00]`}
          >
            Track Order
          </Link>
        )}

        {(category === "delivered" || category === "cancelled") && primary && (
          <Link
            href={productHref(primary)}
            className={`${ACTION_LINK_CLASS} bg-[#FF6A00] text-white hover:bg-[#E55F00]`}
          >
            Buy Again
          </Link>
        )}

        {category === "delivered" && primary && (
          <Link
            href={`${productHref(primary)}#reviews`}
            className={`${ACTION_LINK_CLASS} border-2 border-slate-200 text-slate-800 hover:border-[#FF6A00] hover:text-[#FF6A00]`}
          >
            Rate &amp; Review
          </Link>
        )}

        {(category === "delivered" ||
          category === "cancelled" ||
          category === "shipped") && (
          <Link
            href={`/order-detail/${order.id}`}
            className={`${ACTION_LINK_CLASS} border-2 border-slate-200 text-slate-800 hover:border-[#FF6A00] hover:text-[#FF6A00]`}
          >
            View Details
          </Link>
        )}
      </div>
    </article>
  );
});
