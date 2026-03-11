"use client";

import { useState } from "react";

const categories = [
  "Deals",
  "New Arrivals",
  "Best Sellers",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
];

interface CategoryNavProps {
  onCategoryClick?: (cat: string) => void;
}

export function CategoryNav({ onCategoryClick }: CategoryNavProps = {}) {
  const [active, setActive] = useState("Deals");

  return (
    <div
      className="w-full flex items-end justify-center"
      style={{
        height: 50,
        background: "#FFFFFF",
        borderBottom: "0.94px solid #E5E7EB",
      }}
    >
      <div className="flex flex-row items-center gap-2.5">
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActive(cat);
                onCategoryClick?.(cat);
              }}
              className="flex items-center justify-center px-2.5"
              style={{
                paddingTop: 5,
                paddingBottom: 10,
                borderBottom: isActive ? "2px solid #FF6A00" : "2px solid transparent",
                transition: "border-color 0.2s",
              }}
            >
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: isActive ? "#FF6A00" : "#364153",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
