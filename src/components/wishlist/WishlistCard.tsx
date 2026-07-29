"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, ShoppingBag, ShoppingCart, Trash2, Zap } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import {
  formatRupee,
  formatVariantLabel,
  getDiscountPercent,
  getStockStatus,
  isWishlistItemInStock,
  productHref,
  type WishlistItem,
} from "@/lib/wishlist/wishlist-utils";

type WishlistCardProps = {
  item: WishlistItem;
  inCart: boolean;
  isRemoving: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
  onBuyNow: (item: WishlistItem) => void;
  onGoToCart: () => void;
  animationDelayMs?: number;
};

const ACTION_BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:ring-offset-2";

function RatingRow({ rating }: { rating: number | null }) {
  if (rating == null || rating <= 0) return null;
  return (
    <div className="mb-2 flex items-center gap-1.5" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
        {rating.toFixed(1)}
      </span>
      <span className="text-xs text-slate-500" aria-hidden="true">
        ★
      </span>
    </div>
  );
}

function StockBadge({ item }: { item: WishlistItem }) {
  const status = getStockStatus(item);
  if (status === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        <span aria-hidden="true">🟢</span> In Stock
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
        <span aria-hidden="true">🟡</span> Only {item.product.stock} Left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
      <span aria-hidden="true">🔴</span> Out of Stock
    </span>
  );
}

export const WishlistCard = memo(function WishlistCard({
  item,
  inCart,
  isRemoving,
  isAddingToCart,
  isBuyingNow,
  onRemove,
  onAddToCart,
  onBuyNow,
  onGoToCart,
  animationDelayMs = 0,
}: WishlistCardProps) {
  const inStock = isWishlistItemInStock(item);
  const discount = useMemo(
    () => getDiscountPercent(item.product.sellingPrice, item.product.mrp),
    [item.product.sellingPrice, item.product.mrp]
  );
  const variantLabel = formatVariantLabel(item.variantKey);
  const href = productHref(item);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isRemoving ? "pointer-events-none scale-95 opacity-0" : "opacity-100 iv-enter"
      }`}
      style={{
        animationDelay: isRemoving ? undefined : `${animationDelayMs}ms`,
      }}
      aria-label={`Wishlist item: ${item.product.name}`}
    >
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={isRemoving}
        className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-colors hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400/40 disabled:opacity-50"
        aria-label={`Remove ${item.product.name} from wishlist`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {discount != null && discount > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
          {discount}% OFF
        </div>
      )}

      <Link
        href={href}
        className="block overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6A00]/40"
        aria-label={`View ${item.product.name}`}
      >
        <div className="relative aspect-[4/5] bg-slate-100 transition-transform duration-300 group-hover:scale-[1.02]">
          <ProductImage
            src={item.product.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          {!inStock && (
            <div className="absolute inset-0 flex items-end justify-center bg-slate-900/50 pb-6">
              <span className="rounded-lg bg-slate-900/90 px-4 py-2 text-sm font-bold text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2">
          <StockBadge item={item} />
        </div>

        <RatingRow rating={item.product.avgRating} />

        <Link
          href={href}
          className="mb-2 block rounded focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        >
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-[#FF6A00]">
            {item.product.name}
          </h3>
        </Link>

        {variantLabel && <p className="mb-2 text-sm text-slate-600">{variantLabel}</p>}

        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <p className="text-xl font-bold text-slate-900">
            {formatRupee(item.product.sellingPrice)}
          </p>
          {item.product.mrp > item.product.sellingPrice && (
            <span className="text-sm text-slate-400 line-through">
              {formatRupee(item.product.mrp)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {inCart ? (
            <button
              type="button"
              onClick={onGoToCart}
              className={`${ACTION_BTN} col-span-2 bg-slate-900 text-white hover:bg-slate-800`}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Go to Cart
            </button>
          ) : (
            <button
              type="button"
              disabled={!inStock || isAddingToCart}
              onClick={() => onAddToCart(item)}
              className={`${ACTION_BTN} bg-[#FF6A00] text-white hover:bg-[#E55F00] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {isAddingToCart ? "Adding…" : "Add to Cart"}
            </button>
          )}

          <button
            type="button"
            disabled={!inStock || isBuyingNow}
            onClick={() => onBuyNow(item)}
            className={`${ACTION_BTN} border-2 border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400`}
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            {isBuyingNow ? "Starting…" : "Buy Now"}
          </button>

          <Link
            href={href}
            className={`${ACTION_BTN} col-span-2 border-2 border-slate-200 text-slate-700 hover:border-[#FF6A00] hover:text-[#FF6A00]`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
});
