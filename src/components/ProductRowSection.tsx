"use client";

import { memo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import type { ListingCommerce } from "@/hooks/useListingCommerce";

export interface ProductRowSectionProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products: ProductListItem[];
  bgColor?: string;
  loading?: boolean;
  commerce?: ListingCommerce;
  className?: string;
  animationDelayMs?: number;
}

export const ProductRowSection = memo(function ProductRowSection({
  title,
  subtitle,
  ctaLabel = "View All",
  products,
  ctaHref,
  bgColor = "#FFFFFF",
  loading = false,
  commerce,
  className = "",
  animationDelayMs = 0,
}: ProductRowSectionProps) {
  if (!loading && products.length === 0) return null;

  return (
    <section
      className={`home-section-enter w-full ${className}`}
      style={{ background: bgColor, animationDelay: `${animationDelayMs}ms` }}
      aria-label={title}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-6 sm:gap-4 sm:px-4 sm:py-8 lg:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {ctaHref ? (
              <Link
                href={ctaHref}
                className="block rounded-md text-base font-extrabold text-slate-900 no-underline transition-colors hover:text-[#FF6A00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6A00] sm:text-lg"
              >
                {title}
              </Link>
            ) : (
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500 sm:text-[15px]">{subtitle}</p>
            )}
          </div>
          {ctaHref && (
            <Link
              href={ctaHref}
              className="hidden shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#FF6A00] transition hover:border-[#FF6A00]/40 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 sm:inline-flex sm:text-sm"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
        </div>

        {loading ? (
          <ProductCardSkeleton layout="carousel" count={5} />
        ) : (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="carousel"
                animationDelayMs={Math.min(index * 50, 250)}
                showWishlist={Boolean(commerce)}
                isWishlisted={commerce?.isWishlisted(product.id) ?? false}
                wishlistLoading={commerce?.wishlistTogglingId === product.id}
                onWishlistToggle={
                  commerce ? () => void commerce.toggleWishlist(product) : undefined
                }
                cartQuantity={commerce?.getCartQuantity(product.id) ?? 0}
                cartLoading={commerce?.cartActionProductId === product.id}
                onAddToCart={commerce ? () => void commerce.addToCart(product) : undefined}
                onIncrementCart={commerce ? () => commerce.incrementCart(product) : undefined}
                onDecrementCart={commerce ? () => commerce.decrementCart(product) : undefined}
                onGoToCart={commerce ? () => commerce.openCartDrawer() : undefined}
              />
            ))}
          </div>
        )}

        {ctaHref && (
          <Link
            href={ctaHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#FF6A00] bg-white px-3.5 py-2 text-sm font-semibold text-[#FF6A00] shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 sm:hidden"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
});
