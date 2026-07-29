"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import {
  formatProductRupee,
  getProductDiscountPercent,
  getProductStockBadge,
  hasProductRating,
  productDetailHref,
  type ProductCardProduct,
} from "@/lib/product/product-card-utils";

export type ProductCardProps = {
  product: ProductCardProduct;
  layout?: "grid" | "carousel";
  className?: string;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  wishlistLoading?: boolean;
  onWishlistToggle?: () => void;
  cartQuantity?: number;
  cartLoading?: boolean;
  onAddToCart?: () => void;
  onIncrementCart?: () => void;
  onDecrementCart?: () => void;
  onGoToCart?: () => void;
  animationDelayMs?: number;
};

const CARD_BASE =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]";

function StockBadge({ product }: { product: ProductCardProduct }) {
  const status = getProductStockBadge(product);
  if (!status) return null;
  if (status === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <span aria-hidden="true">🟢</span> In Stock
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800">
        <span aria-hidden="true">🟡</span> Only {product.stock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
      <span aria-hidden="true">🔴</span> Out of Stock
    </span>
  );
}

function CartControls({
  quantity,
  loading,
  outOfStock,
  onAdd,
  onIncrement,
  onDecrement,
  onGoToCart,
}: {
  quantity: number;
  loading: boolean;
  outOfStock: boolean;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onGoToCart?: () => void;
}) {
  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-400"
      >
        Out of Stock
      </button>
    );
  }

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-1 py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={loading}
            onClick={onDecrement}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 disabled:opacity-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-bold text-slate-900">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={loading}
            onClick={onIncrement}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onGoToCart}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-[#FF6A00] hover:text-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        >
          Cart
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onAdd}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6A00] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:ring-offset-2 disabled:opacity-60"
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      {loading ? "Adding…" : "Add"}
    </button>
  );
}

export const ProductCard = memo(function ProductCard({
  product,
  layout = "grid",
  className = "",
  showWishlist = true,
  isWishlisted = false,
  wishlistLoading = false,
  onWishlistToggle,
  cartQuantity = 0,
  cartLoading = false,
  onAddToCart,
  onIncrementCart,
  onDecrementCart,
  onGoToCart,
  animationDelayMs = 0,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const href = productDetailHref(product);
  const discount = getProductDiscountPercent(product.price, product.oldPrice);
  const stockBadge = getProductStockBadge(product);
  const outOfStock = stockBadge === "out_of_stock";

  const handleCardPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    window.setTimeout(() => setRipple(null), 450);
  }, []);

  const layoutClass =
    layout === "carousel"
      ? "w-[200px] shrink-0 sm:w-[220px] md:w-[240px]"
      : "w-full";

  return (
    <article
      className={`${CARD_BASE} ${layoutClass} product-card-enter ${className}`}
      style={{ animationDelay: `${animationDelayMs}ms` }}
      onPointerDown={handleCardPointerDown}
      aria-label={product.name}
    >
      {ripple && (
        <span
          className="pointer-events-none absolute z-20 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6A00]/15 animate-ping"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      )}

      <div className="relative aspect-square bg-slate-50 p-3 sm:p-4">
        {showWishlist && onWishlistToggle && (
          <button
            type="button"
            disabled={wishlistLoading}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onWishlistToggle();
            }}
            className={`absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/70 disabled:opacity-60 ${
              isWishlisted ? "scale-105" : ""
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
          >
            <Heart
              className={`h-4 w-4 transition-transform ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        )}

        <Link
          href={href}
          className="relative block h-full w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6A00]/40"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt=""
            className={`h-full w-full object-contain object-center transition-all duration-500 group-hover:scale-[1.03] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse rounded-xl bg-slate-200/70" aria-hidden="true" />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={href} className="mb-2 block rounded focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#FF6A00] sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {hasProductRating(product) && (
          <div
            className="mb-2 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label={`Rating ${product.rating.toFixed(1)}${product.reviews ? ` from ${product.reviews} reviews` : ""}`}
          >
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">
              <span aria-hidden="true">⭐</span> {product.rating.toFixed(1)}
            </span>
            {product.reviews > 0 && (
              <span className="text-slate-500">({product.reviews.toLocaleString("en-IN")})</span>
            )}
          </div>
        )}

        <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-bold text-slate-900">{formatProductRupee(product.price)}</span>
          {product.oldPrice != null && product.oldPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              {formatProductRupee(product.oldPrice)}
            </span>
          )}
          {discount != null && discount > 0 && (
            <span className="text-xs font-bold text-emerald-700">{discount}% OFF</span>
          )}
        </div>

        {product.sellerName && (
          <p className="mb-1 truncate text-xs text-slate-500">Sold by {product.sellerName}</p>
        )}

        {stockBadge && (
          <div className="mb-3">
            <StockBadge product={product} />
          </div>
        )}

        <div className="mt-auto pt-1">
          <CartControls
            quantity={cartQuantity}
            loading={cartLoading}
            outOfStock={outOfStock}
            onAdd={onAddToCart}
            onIncrement={onIncrementCart}
            onDecrement={onDecrementCart}
            onGoToCart={onGoToCart}
          />
        </div>
      </div>
    </article>
  );
});
