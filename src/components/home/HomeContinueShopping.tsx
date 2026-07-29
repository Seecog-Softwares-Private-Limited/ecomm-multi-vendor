"use client";

import { memo, useEffect, useState } from "react";
import { fetchContinueShoppingProducts } from "@/lib/home/home-page-data";
import type { ProductListItem } from "@/types/catalog";
import { ProductRowSection } from "@/components/ProductRowSection";
import type { ListingCommerce } from "@/hooks/useListingCommerce";

type HomeContinueShoppingProps = {
  commerce?: ListingCommerce;
  refreshKey?: number;
};

export const HomeContinueShopping = memo(function HomeContinueShopping({
  commerce,
  refreshKey = 0,
}: HomeContinueShoppingProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchContinueShoppingProducts()
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <ProductRowSection
      title="Continue Shopping"
      subtitle="Items waiting in your cart"
      ctaLabel="Go to cart"
      ctaHref="/cart"
      products={products}
      loading={loading}
      commerce={commerce}
      bgColor="#FFFFFF"
      animationDelayMs={80}
    />
  );
});
