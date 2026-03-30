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

/** Menu label -> URL slug (mobile-only icon colors; icons are hidden from md and up). */
const MENU_ITEMS: { label: string; slug: string; icon: LucideIcon; mobileIconColor: string }[] = [
  { label: "Deals", slug: "deals", icon: Tag, mobileIconColor: "#DC2626" },
  { label: "New Arrivals", slug: "new-arrivals", icon: PackagePlus, mobileIconColor: "#2563EB" },
  { label: "Best Sellers", slug: "best-sellers", icon: TrendingUp, mobileIconColor: "#16A34A" },
  { label: "Electronics", slug: "electronics", icon: Monitor, mobileIconColor: "#7C3AED" },
  { label: "Fashion", slug: "fashion", icon: Shirt, mobileIconColor: "#DB2777" },
  { label: "Home & Living", slug: "home", icon: Armchair, mobileIconColor: "#EA580C" },
  { label: "Beauty", slug: "beauty", icon: Sparkles, mobileIconColor: "#C026D3" },
  { label: "Sports", slug: "sports", icon: Dumbbell, mobileIconColor: "#059669" },
  { label: "Books", slug: "books", icon: BookOpen, mobileIconColor: "#CA8A04" },
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
        {MENU_ITEMS.map(({ label, slug, icon: Icon, mobileIconColor }) => {
          const isActive = currentSlug === slug;
          const activeColor = "#FF6A00";

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
                style={{
                  background: isActive
                    ? "rgba(255,106,0,0.12)"
                    : `${mobileIconColor}14`,
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={1.75}
                  color={isActive ? activeColor : mobileIconColor}
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
