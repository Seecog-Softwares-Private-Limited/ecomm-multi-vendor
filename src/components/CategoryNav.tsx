"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Tag,
  PackagePlus,
  TrendingUp,
  Monitor,
  Shirt,
  Armchair,
  Sparkles,
  Dumbbell,
  BookOpen,
} from "lucide-react";

/** Menu label -> URL slug (for /category/[slug]) + icon (mobile: stacked above label, Flipkart-style). */
const MENU_ITEMS: { label: string; slug: string; icon: LucideIcon }[] = [
  { label: "Deals", slug: "deals", icon: Tag },
  { label: "New Arrivals", slug: "new-arrivals", icon: PackagePlus },
  { label: "Best Sellers", slug: "best-sellers", icon: TrendingUp },
  { label: "Electronics", slug: "electronics", icon: Monitor },
  { label: "Fashion", slug: "fashion", icon: Shirt },
  { label: "Home & Living", slug: "home", icon: Armchair },
  { label: "Beauty", slug: "beauty", icon: Sparkles },
  { label: "Sports", slug: "sports", icon: Dumbbell },
  { label: "Books", slug: "books", icon: BookOpen },
];

interface CategoryNavProps {
  onCategoryClick?: (cat: string) => void;
}

export function CategoryNav({ onCategoryClick }: CategoryNavProps = {}) {
  const pathname = usePathname();
  const currentSlug = pathname?.startsWith("/category/")
    ? pathname.replace("/category/", "").split("?")[0].split("/")[0]?.toLowerCase()
    : "";

  return (
    <div
      className="w-full overflow-x-auto backdrop-blur-md md:flex md:h-[50px] md:items-end md:justify-center min-h-[78px] md:min-h-0"
      style={{
        background: "rgba(255,255,255,0.82)",
        borderBottom: "1px solid rgba(229,231,235,0.9)",
        scrollbarWidth: "none",
      }}
    >
      <div className="flex flex-row items-end gap-1.5 px-2 pb-1.5 pt-2 md:items-center md:gap-2.5 md:px-0 md:py-0 snap-x snap-mandatory md:snap-none">
        {MENU_ITEMS.map(({ label, slug, icon: Icon }) => {
          const isActive = currentSlug === slug;
          const activeColor = "#FF6A00";
          const idleColor = "#6B7280";

          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              onClick={() => onCategoryClick?.(label)}
              className="flex min-w-[70px] shrink-0 snap-center flex-col items-center justify-end gap-1 border-b-2 px-1 pb-2 pt-0.5 transition-colors md:min-w-0 md:flex-row md:justify-center md:px-2.5 md:pb-2.5 md:pt-1 md:gap-0"
              style={{
                borderBottomColor: isActive ? activeColor : "transparent",
              }}
            >
              {/* Icon — mobile only, above label */}
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl md:hidden"
                style={{ background: "rgba(248,250,252,0.95)" }}
              >
                <Icon
                  size={22}
                  strokeWidth={1.75}
                  color={isActive ? activeColor : idleColor}
                  aria-hidden
                />
              </span>
              <span
                className="max-w-[76px] text-center text-[10px] leading-[1.25] text-[#6B7280] md:max-w-none md:text-[15px] md:leading-normal md:whitespace-nowrap"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#111827" : "#6B7280",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
