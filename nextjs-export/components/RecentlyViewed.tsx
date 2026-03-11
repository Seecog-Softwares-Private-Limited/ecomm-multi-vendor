"use client";

import { useRef } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

const recentProducts = [
  {
    src: "https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Headphones",
  },
  {
    src: "https://images.unsplash.com/photo-1760520338259-64e68f6850b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Smartwatch",
  },
  {
    src: "https://images.unsplash.com/photo-1762690285055-fa80848e825b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Running shoes",
  },
  {
    src: "https://images.unsplash.com/photo-1595051665600-afd01ea7c446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Beauty products",
  },
  {
    src: "https://images.unsplash.com/photo-1759840279499-f9de9764b2cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    alt: "Fashion",
  },
];

export function RecentlyViewed() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <div
      className="w-full flex flex-col gap-5 px-10"
      style={{ maxWidth: 1440, margin: "0 auto" }}
    >
      {/* Section title */}
      <h2
        style={{
          fontFamily: "'Nunito', 'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 24,
          lineHeight: "39px",
          color: "#FF6A00",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
        }}
      >
        Recently Viewed Products
      </h2>

      {/* Scroll container */}
      <div className="relative" style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        {/* Left arrow */}
        <button
          onClick={scrollLeft}
          className="absolute flex items-center justify-center z-10"
          style={{
            width: 44,
            height: 44,
            left: -22,
            top: "50%",
            transform: "translateY(-50%)",
            background: "#FFFFFF",
            border: "1px solid #FF6A00",
            boxShadow: "2px 2px 2px rgba(0,0,0,0.1)",
            borderRadius: 12,
          }}
        >
          <ArrowLeft size={24} color="#FF6A00" />
        </button>

        {/* Scrollable images */}
        <div
          ref={scrollRef}
          className="flex flex-row overflow-x-auto"
          style={{ scrollbarWidth: "none", scrollBehavior: "smooth", gap: 32.5 }}
        >
          {recentProducts.map((p, i) => (
            <img
              key={i}
              src={p.src}
              alt={p.alt}
              className="shrink-0 object-cover"
              style={{
                width: 230,
                height: 230,
                borderRadius: 12,
                background: "#000",
              }}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={scrollRight}
          className="absolute flex items-center justify-center z-10"
          style={{
            width: 44,
            height: 44,
            right: -22,
            top: "50%",
            transform: "translateY(-50%)",
            background: "#FFFFFF",
            border: "1px solid #FF6A00",
            boxShadow: "2px 2px 2px rgba(0,0,0,0.1)",
            borderRadius: 12,
          }}
        >
          <ArrowRight size={24} color="#FF6A00" />
        </button>
      </div>
    </div>
  );
}
