"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { CategoryNav } from "./CategoryNav";
import { PromoBanners } from "./PromoBanners";
import { DealCards } from "./DealCards";
import { RecentlyViewed } from "./RecentlyViewed";
import { HeroBanner } from "./HeroBanner";
import { ProductRowSection } from "./ProductRowSection";
import { InspiredSection } from "./InspiredSection";
import { Footer } from "./Footer";
import type { ProductListItem } from "@/types/catalog";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";
import Link from "next/link";
import { Home, LayoutGrid, ClipboardList, Heart, User } from "lucide-react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

async function fetchProductsByCategory(
  categorySlug: string,
  limit: number,
  pincode: string
): Promise<ProductListItem[]> {
  const params = new URLSearchParams({ categorySlug, limit: String(limit) });
  const pin = pincode.replace(/\D/g, "").slice(0, 6);
  if (/^\d{6}$/.test(pin)) params.set("pincode", pin);
  const res = await fetch(`/api/products?${params.toString()}`, { credentials: "include" });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? (json.data as ProductListItem[]) : [];
}

export function HomePage() {
  const { location } = useDeliveryLocation();
  const [electronics, setElectronics] = useState<ProductListItem[]>([]);
  const [home, setHome] = useState<ProductListItem[]>([]);
  const [beauty, setBeauty] = useState<ProductListItem[]>([]);
  const [fashion, setFashion] = useState<ProductListItem[]>([]);
  const [sports, setSports] = useState<ProductListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const pin = location.pincode ?? "";
    (async () => {
      const [e, h, b, f, s] = await Promise.all([
        fetchProductsByCategory("electronics", 5, pin),
        fetchProductsByCategory("home", 5, pin),
        fetchProductsByCategory("beauty", 5, pin),
        fetchProductsByCategory("fashion", 5, pin),
        fetchProductsByCategory("sports", 5, pin),
      ]);
      if (cancelled) return;
      setElectronics(e);
      setHome(h);
      setBeauty(b);
      setFashion(f);
      setSports(s);
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pincode]);

  const electronicsRow = useMemo(
    () => ({
      title: "Smarter Tech | Trending Gadgets | Best Value Picks",
      ctaLabel: "Explore Electronics",
      ctaHref: "/category/electronics",
      bgColor: "#FAFAFA",
      products: (electronics.length ? electronics : []).map((p) => ({
        src: p.imageUrl || PLACEHOLDER,
        alt: p.name,
        href: `/product/${p.id}`,
      })),
    }),
    [electronics]
  );

  const homeRow = useMemo(
    () => ({
      title: "Flat 40% Off on Home Essentials | Best Prices on Living Décor",
      ctaLabel: "Shop Home",
      ctaHref: "/category/home",
      bgColor: "#FFFFFF",
      products: (home.length ? home : []).map((p) => ({
        src: p.imageUrl || PLACEHOLDER,
        alt: p.name,
        href: `/product/${p.id}`,
      })),
    }),
    [home]
  );

  const beautyRow = useMemo(
    () => ({
      title: "Glow Up Sale | Skincare Starting ₹199 | Best Sellers in Beauty",
      ctaLabel: "Glow Now",
      ctaHref: "/category/beauty",
      bgColor: "#FAFAFA",
      products: (beauty.length ? beauty : []).map((p) => ({
        src: p.imageUrl || PLACEHOLDER,
        alt: p.name,
        href: `/product/${p.id}`,
      })),
    }),
    [beauty]
  );

  const fashionRow = useMemo(
    () => ({
      title: "New Arrivals — Dropped | From Casual to Festive | Everything You Love",
      ctaLabel: "Shop Fashion",
      ctaHref: "/category/fashion",
      bgColor: "#FFFFFF",
      products: (fashion.length ? fashion : []).map((p) => ({
        src: p.imageUrl || PLACEHOLDER,
        alt: p.name,
        href: `/product/${p.id}`,
      })),
    }),
    [fashion]
  );

  const sportsRow = useMemo(
    () => ({
      title: "Fitness Gear Starting ₹499 | Up to 55% Off | Get Game Ready",
      ctaLabel: "Shop Sports",
      ctaHref: "/category/sports",
      bgColor: "#FAFAFA",
      products: (sports.length ? sports : []).map((p) => ({
        src: p.imageUrl || PLACEHOLDER,
        alt: p.name,
        href: `/product/${p.id}`,
      })),
    }),
    [sports]
  );

  return (
    <div
      className="w-full min-h-screen pb-[calc(78px+env(safe-area-inset-bottom,0px))] md:pb-0"
      style={{ background: "#FFFFFF", fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar />
      {/* CategoryNav — clicking any category navigates to the category page */}
      <CategoryNav />

      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <PromoBanners />
      </div>

      <div style={{ marginTop: 40 }}>
        <DealCards />
      </div>

      <div style={{ marginTop: 50 }}>
        <RecentlyViewed />
      </div>

      <div style={{ marginTop: 50 }}>
        <HeroBanner />
      </div>

      <div style={{ marginTop: 0 }}>
        <ProductRowSection {...electronicsRow} products={(electronicsRow.products.length ? electronicsRow.products : Array.from({ length: 5 }).map((_, i) => ({ src: PLACEHOLDER, alt: `Loading ${i + 1}` })))} />
      </div>

      <ProductRowSection {...homeRow} products={(homeRow.products.length ? homeRow.products : Array.from({ length: 5 }).map((_, i) => ({ src: PLACEHOLDER, alt: `Loading ${i + 1}` })))} />
      <ProductRowSection {...beautyRow} products={(beautyRow.products.length ? beautyRow.products : Array.from({ length: 5 }).map((_, i) => ({ src: PLACEHOLDER, alt: `Loading ${i + 1}` })))} />
      <ProductRowSection {...fashionRow} products={(fashionRow.products.length ? fashionRow.products : Array.from({ length: 5 }).map((_, i) => ({ src: PLACEHOLDER, alt: `Loading ${i + 1}` })))} />
      <ProductRowSection {...sportsRow} products={(sportsRow.products.length ? sportsRow.products : Array.from({ length: 5 }).map((_, i) => ({ src: PLACEHOLDER, alt: `Loading ${i + 1}` })))} />

      <InspiredSection />
      <Footer />

      {/* Mobile app-style bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
        style={{
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Mobile bottom navigation"
      >
        <div className="mx-auto flex h-[68px] max-w-[560px] items-center justify-around px-2">
          <Link
            href="/"
            className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[#FF6A00]"
          >
            <Home size={20} />
            <span className="text-[11px] font-semibold">Home</span>
          </Link>
          <Link
            href="/category/electronics"
            className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[#6B7280]"
          >
            <LayoutGrid size={20} />
            <span className="text-[11px] font-medium">Categories</span>
          </Link>
          <Link
            href="/my-orders"
            className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[#6B7280]"
          >
            <ClipboardList size={20} />
            <span className="text-[11px] font-medium">Orders</span>
          </Link>
          <Link
            href="/wishlist"
            className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[#6B7280]"
          >
            <Heart size={20} />
            <span className="text-[11px] font-medium">Wishlist</span>
          </Link>
          <Link
            href="/profile"
            className="flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[#6B7280]"
          >
            <User size={20} />
            <span className="text-[11px] font-medium">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
