"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { HomeCategoriesStrip } from "@/components/home/HomeCategoriesStrip";
import { HomeContinueShopping } from "@/components/home/HomeContinueShopping";
import { HomePullRefreshIndicator } from "@/components/home/HomeSkeletons";
import { RecentlyViewed } from "./RecentlyViewed";
import { ProductRowSection } from "./ProductRowSection";
import type { ProductListItem } from "@/types/catalog";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";
import { useListingCommerce } from "@/hooks/useListingCommerce";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import {
  fetchHomePageProducts,
  type HomePageProducts,
} from "@/lib/home/home-page-data";

const EMPTY_PRODUCTS: HomePageProducts = {
  bestSellers: [],
  newArrivals: [],
  deals: [],
  recommended: [],
  topRated: [],
  electronics: [],
  home: [],
  beauty: [],
  fashion: [],
  sports: [],
};

type HomeProductSectionsProps = {
  data: HomePageProducts;
  loading: boolean;
  commerce: ReturnType<typeof useListingCommerce>;
};

const HomeProductSections = memo(function HomeProductSections({
  data,
  loading,
  commerce,
}: HomeProductSectionsProps) {
  const sections: Array<{
    key: string;
    title: string;
    subtitle?: string;
    ctaHref: string;
    ctaLabel?: string;
    products: ProductListItem[];
    bgColor: string;
    delay: number;
  }> = [
    {
      key: "best-sellers",
      title: "🔥 Best Sellers",
      subtitle: "Most loved by shoppers this week",
      ctaHref: "/category/best-sellers",
      products: data.bestSellers,
      bgColor: "#FAFAFA",
      delay: 0,
    },
    {
      key: "new-arrivals",
      title: "✨ New Arrivals",
      subtitle: "Fresh picks just dropped",
      ctaHref: "/category/new-arrivals",
      products: data.newArrivals,
      bgColor: "#FFFFFF",
      delay: 40,
    },
    {
      key: "deals",
      title: "⚡ Deals of the Day",
      subtitle: "Biggest discounts — today only",
      ctaHref: "/category/deals",
      products: data.deals,
      bgColor: "#FAFAFA",
      delay: 80,
    },
    {
      key: "recommended",
      title: "❤️ Recommended For You",
      subtitle: "Curated based on trending picks",
      ctaHref: "/search",
      products: data.recommended,
      bgColor: "#FFFFFF",
      delay: 120,
    },
    {
      key: "top-rated",
      title: "🏆 Top Rated",
      subtitle: "Highest rated by customers",
      ctaHref: "/category/best-sellers",
      products: data.topRated,
      bgColor: "#FAFAFA",
      delay: 160,
    },
    {
      key: "electronics",
      title: "Smarter Tech",
      subtitle: "Trending gadgets & best value picks",
      ctaHref: "/category/electronics",
      ctaLabel: "Explore Electronics",
      products: data.electronics,
      bgColor: "#FFFFFF",
      delay: 200,
    },
    {
      key: "home",
      title: "Home Essentials",
      subtitle: "Décor, kitchen & living — best prices",
      ctaHref: "/category/home",
      ctaLabel: "Shop Home",
      products: data.home,
      bgColor: "#FAFAFA",
      delay: 240,
    },
    {
      key: "beauty",
      title: "Beauty & Glow",
      subtitle: "Skincare starting ₹199",
      ctaHref: "/category/beauty",
      ctaLabel: "Glow Now",
      products: data.beauty,
      bgColor: "#FFFFFF",
      delay: 280,
    },
    {
      key: "fashion",
      title: "Fashion Finds",
      subtitle: "From casual to festive",
      ctaHref: "/category/fashion",
      ctaLabel: "Shop Fashion",
      products: data.fashion,
      bgColor: "#FAFAFA",
      delay: 320,
    },
    {
      key: "sports",
      title: "Sports & Fitness",
      subtitle: "Gear starting ₹499",
      ctaHref: "/category/sports",
      ctaLabel: "Shop Sports",
      products: data.sports,
      bgColor: "#FFFFFF",
      delay: 360,
    },
  ];

  return (
    <>
      {sections.map((section) => (
        <ProductRowSection
          key={section.key}
          title={section.title}
          subtitle={section.subtitle}
          ctaHref={section.ctaHref}
          ctaLabel={section.ctaLabel}
          products={section.products}
          loading={loading}
          commerce={commerce}
          bgColor={section.bgColor}
          animationDelayMs={section.delay}
        />
      ))}
    </>
  );
});

export function HomePage() {
  const { location } = useDeliveryLocation();
  const commerce = useListingCommerce();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<HomePageProducts>(EMPTY_PRODUCTS);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHomeData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      const pin = location.pincode ?? "";
      const data = await fetchHomePageProducts(pin);
      setProducts(data);
      if (showLoading) setLoading(false);
      setRefreshKey((k) => k + 1);
    },
    [location.pincode]
  );

  useEffect(() => {
    void loadHomeData(true);
  }, [loadHomeData]);

  const { refreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: () => loadHomeData(false),
  });

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      <HomePullRefreshIndicator
        progress={progress}
        refreshing={refreshing}
        pullDistance={pullDistance}
      />

      <TopBar />

      <Navbar homeLayout />

      <main className="pb-6 md:pb-10">
        <HomeHeroCarousel />

        <HomeCategoriesStrip refreshKey={refreshKey} />

        <HomeProductSections data={products} loading={loading} commerce={commerce} />

        <HomeContinueShopping commerce={commerce} refreshKey={refreshKey} />

        <RecentlyViewed commerce={commerce} refreshKey={refreshKey} />
      </main>
    </div>
  );
}
