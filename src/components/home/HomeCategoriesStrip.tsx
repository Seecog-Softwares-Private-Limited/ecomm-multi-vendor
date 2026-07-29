"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { CategoryItem } from "@/types/catalog";
import { HomeCategoriesSkeleton } from "@/components/home/HomeSkeletons";

const CURATED_MENU = [
  { slug: "deals", name: "Deals", icon: "🏷️", href: "/category/deals" },
  { slug: "new-arrivals", name: "New", icon: "✨", href: "/category/new-arrivals" },
  { slug: "best-sellers", name: "Best Sellers", icon: "🔥", href: "/category/best-sellers" },
];

type HomeCategoriesStripProps = {
  refreshKey?: number;
};

export const HomeCategoriesStrip = memo(function HomeCategoriesStrip({
  refreshKey = 0,
}: HomeCategoriesStripProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const d = j?.data;
        setCategories(Array.isArray(d) ? (d as CategoryItem[]) : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <section aria-label="Shop by category" className="home-section-enter py-4">
        <HomeCategoriesSkeleton />
      </section>
    );
  }

  const items = [
    ...CURATED_MENU.map((m) => ({
      key: `menu-${m.slug}`,
      href: m.href,
      name: m.name,
      icon: m.icon,
      gradient: "from-orange-100 to-amber-50",
    })),
    ...categories.map((c) => ({
      key: c.id,
      href: `/category/${c.slug}`,
      name: c.name,
      icon: c.icon ?? "📦",
      gradient: c.color ?? "from-slate-100 to-slate-50",
    })),
  ];

  if (items.length === 0) return null;

  return (
    <section aria-label="Shop by category" className="home-section-enter py-4">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 lg:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Shop by Category</h2>
          <Link
            href="/browse-categories"
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#FF6A00] shadow-sm transition hover:border-[#FF6A00]/40 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 sm:text-sm"
          >
            See All
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]/40 sm:w-[5.25rem]"
              aria-label={`Browse ${item.name}`}
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-2xl shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 group-active:scale-95 sm:h-[4.5rem] sm:w-[4.5rem] sm:text-[1.65rem]`}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="line-clamp-2 w-full text-center text-[11px] font-semibold leading-tight text-slate-700 sm:text-xs">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});
