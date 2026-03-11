"use client";

import { useRouter } from "next/navigation";
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

const electronicsRow = {
  title: "Smarter Tech | Upgrade Your Camera | Faster Confirmation Dates",
  ctaLabel: "Explore Deals",
  bgColor: "#FAFAFA",
  products: [
    { src: "https://images.unsplash.com/photo-1735980968208-1b85bdcd857b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Camera" },
    { src: "https://images.unsplash.com/photo-1703482771739-caef1f39797e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Keyboard" },
    { src: "https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Headphones" },
    { src: "https://images.unsplash.com/photo-1767608403467-d30e6640b908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Mouse" },
    { src: "https://images.unsplash.com/photo-1671072012624-c2089f89753f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Tablet" },
  ],
};

const homeRow = {
  title: "Flat 40% Off on Home Essentials | Best Prices on Living Décor",
  ctaLabel: "Shop Now",
  bgColor: "#FFFFFF",
  products: [
    { src: "https://images.unsplash.com/photo-1759722668253-1767030ad9b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Sofa" },
    { src: "https://images.unsplash.com/photo-1769653907239-c8f1a1843b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Plants" },
    { src: "https://images.unsplash.com/photo-1576834976341-53b1b975c6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Bottle" },
    { src: "https://images.unsplash.com/photo-1758640927926-9f0b1cda712e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Kitchen" },
    { src: "https://images.unsplash.com/photo-1765766601447-9e11ad2356da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Furniture" },
  ],
};

const beautyRow = {
  title: "Glow Up Sale | Skincare Starting ₹199 | Best Sellers in Beauty",
  ctaLabel: "Glow Now",
  bgColor: "#FAFAFA",
  products: [
    { src: "https://images.unsplash.com/photo-1595051665600-afd01ea7c446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Beauty" },
    { src: "https://images.unsplash.com/photo-1571782742478-0816a4773a10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Skincare" },
    { src: "https://images.unsplash.com/photo-1602532386405-9f3cce79a00b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Lipstick" },
    { src: "https://images.unsplash.com/photo-1595051665600-afd01ea7c446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Cosmetics" },
    { src: "https://images.unsplash.com/photo-1571782742478-0816a4773a10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Cream" },
  ],
};

const fashionRow = {
  title: "New Arrivals — Dropped | From Casual to Festive | Everything You Love",
  ctaLabel: "Shop the Look",
  bgColor: "#FFFFFF",
  products: [
    { src: "https://images.unsplash.com/photo-1759840279499-f9de9764b2cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Fashion" },
    { src: "https://images.unsplash.com/photo-1760126130290-bbbc9b41292a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "T-Shirt" },
    { src: "https://images.unsplash.com/photo-1656911545349-3a775d54f2b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Store" },
    { src: "https://images.unsplash.com/photo-1729808783871-797a683a07b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Street" },
    { src: "https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Indian" },
  ],
};

const sportsRow = {
  title: "Fitness Gear Starting ₹499 | Up to 55% Off | Get Game Ready",
  ctaLabel: "Get Game Ready",
  bgColor: "#FAFAFA",
  products: [
    { src: "https://images.unsplash.com/photo-1722925541311-2117dfa21fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Gym" },
    { src: "https://images.unsplash.com/photo-1648659125396-5bf148702e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Dumbbell" },
    { src: "https://images.unsplash.com/photo-1683586861092-596182a95463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Protein" },
    { src: "https://images.unsplash.com/photo-1758599879039-625fda430fb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Yoga" },
    { src: "https://images.unsplash.com/photo-1762014532579-ce204c09a11a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", alt: "Cycle" },
  ],
};

export function HomePage() {
  const router = useRouter();

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "#FFFFFF", fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar />
      {/* CategoryNav — clicking any category navigates to the category page */}
      <CategoryNav onCategoryClick={() => router.push("/category/mobile-phones")} />

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
        <ProductRowSection {...electronicsRow} />
      </div>

      <ProductRowSection {...homeRow} />
      <ProductRowSection {...beautyRow} />
      <ProductRowSection {...fashionRow} />
      <ProductRowSection {...sportsRow} />

      <InspiredSection />
      <Footer />
    </div>
  );
}
