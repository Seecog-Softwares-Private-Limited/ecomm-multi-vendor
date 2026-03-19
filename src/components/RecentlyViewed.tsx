"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ProductDetail } from "@/types/catalog";
import { getRecentlyViewedIds } from "@/lib/recently-viewed";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

type RecentItem = { id: string; name: string; imageUrl: string };

async function fetchProduct(id: string): Promise<ProductDetail | null> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  return (json?.data ?? null) as ProductDetail | null;
}

export function RecentlyViewed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<RecentItem[]>([]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ids = getRecentlyViewedIds().slice(0, 12);
      if (ids.length === 0) {
        setItems([]);
        return;
      }
      const results = await Promise.all(ids.map((id) => fetchProduct(id)));
      if (cancelled) return;
      const next: RecentItem[] = results
        .filter((p): p is ProductDetail => !!p && typeof p.id === "string")
        .map((p) => ({
          id: p.id,
          name: p.name,
          imageUrl: (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : PLACEHOLDER) as string,
        }));
      setItems(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const show = useMemo(() => items.length > 0, [items.length]);
  if (!show) return null;

  return (
    <div className="w-full flex flex-col gap-5 px-4 sm:px-6 mx-auto max-w-[1440px]">
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
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="shrink-0 block"
              title={p.name}
              aria-label={p.name}
              style={{ width: 230, height: 230, borderRadius: 12 }}
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                style={{
                  borderRadius: 12,
                  background: "#000",
                }}
              />
            </Link>
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
