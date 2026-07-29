"use client";

import { memo, useEffect, useState } from "react";
import type { ProductListItem, ProductDetail } from "@/types/catalog";
import { getRecentlyViewedIds } from "@/lib/recently-viewed";
import { resolveProductImageUrl } from "@/lib/product-image";
import { ProductRowSection } from "@/components/ProductRowSection";
import type { ListingCommerce } from "@/hooks/useListingCommerce";

async function fetchProduct(id: string): Promise<ProductDetail | null> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  return (json?.data ?? null) as ProductDetail | null;
}

type RecentlyViewedProps = {
  commerce?: ListingCommerce;
  refreshKey?: number;
};

export const RecentlyViewed = memo(function RecentlyViewed({
  commerce,
  refreshKey = 0,
}: RecentlyViewedProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const ids = getRecentlyViewedIds().slice(0, 10);
      if (ids.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      const results = await Promise.all(ids.map((id) => fetchProduct(id)));
      if (cancelled) return;
      const next: ProductListItem[] = results
        .filter((p): p is ProductDetail => !!p && typeof p.id === "string")
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug ?? p.id,
          price: p.price,
          oldPrice: p.oldPrice,
          rating: p.rating ?? 0,
          reviews: p.reviews ?? 0,
          imageUrl: resolveProductImageUrl(Array.isArray(p.images) ? p.images[0] : undefined),
        }));
      setProducts(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <ProductRowSection
      title="Recently Viewed"
      subtitle="Pick up where you left off"
      ctaLabel="See history"
      products={products}
      loading={loading}
      commerce={commerce}
      bgColor="#FAFAFA"
      animationDelayMs={120}
    />
  );
});
