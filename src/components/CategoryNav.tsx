"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Menu label -> URL slug (for /category/[slug]). */
const MENU_ITEMS: { label: string; slug: string }[] = [
  { label: "Deals", slug: "deals" },
  { label: "New Arrivals", slug: "new-arrivals" },
  { label: "Best Sellers", slug: "best-sellers" },
  { label: "Electronics", slug: "electronics" },
  { label: "Fashion", slug: "fashion" },
  { label: "Home & Living", slug: "home" },
  { label: "Beauty", slug: "beauty" },
  { label: "Sports", slug: "sports" },
  { label: "Books", slug: "books" },
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
      className="w-full flex items-end justify-center overflow-x-auto backdrop-blur-md"
      style={{
        height: 50,
        background: "rgba(255,255,255,0.82)",
        borderBottom: "1px solid rgba(229,231,235,0.9)",
        scrollbarWidth: "none",
      }}
    >
      <div className="flex flex-row items-center gap-2.5 px-2 sm:px-0">
        {MENU_ITEMS.map(({ label, slug }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              onClick={() => onCategoryClick?.(label)}
              className="flex items-center justify-center px-2.5 pb-2.5 pt-1 border-b-2 transition-colors"
              style={{
                borderBottomColor: isActive ? "#FF6A00" : "transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 15,
                  color: isActive ? "#111827" : "#6B7280",
                  whiteSpace: "nowrap",
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
