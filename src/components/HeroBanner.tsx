"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ProductListItem } from "@/types/catalog";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1760624294469-550753ec203a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "linear-gradient(90deg, rgba(255,106,0,0.85) 0%, rgba(255,106,0,0.65) 60%, rgba(255,106,0,0.3) 100%)",
    label: "See What's",
    headline: "Trending",
    subline: "",
    href: "/category/best-sellers",
  },
  {
    image:
      "https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "rgba(0,0,0,0.45)",
    label: "New Arrivals Dropped.",
    headline: "Up to 60% Off",
    subline: "From Casual to Festive — Everything You Love",
    href: "/category/new-arrivals",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [trending, setTrending] = useState<ProductListItem[]>([]);
  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  const slide = slides[current];
  const trendingThumbs = useMemo(
    () =>
      trending
        .filter((p) => typeof p?.id === "string")
        .slice(0, 4)
        .map((p) => ({
          id: p.id,
          name: p.name,
          imageUrl:
            p.imageUrl ??
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
        })),
    [trending]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/products?limit=8", { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const list = Array.isArray(json?.data) ? (json.data as ProductListItem[]) : [];
      if (cancelled) return;
      setTrending(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full relative overflow-hidden" style={{ height: 430 }}>
      {/* BG image */}
      <img
        key={current}
        src={slide.image}
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: slide.overlay }}
      />

      {/* Left text */}
      <div
        className="absolute flex flex-col gap-4"
        style={{ left: 120, top: "50%", transform: "translateY(-50%)" }}
      >
        <p
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            fontSize: 40,
            lineHeight: "61px",
            color: "#FFFFFF",
          }}
        >
          {slide.label}
        </p>
        <p
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            fontSize: 96,
            lineHeight: "72px",
            color: "#FFFFFF",
            marginTop: -8,
          }}
        >
          {slide.headline}
        </p>
        {slide.subline && (
          <p
            style={{
              fontFamily: "'Nunito','Manrope',sans-serif",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: "61px",
              color: "#FFFFFF",
            }}
          >
            {slide.subline}
          </p>
        )}

        <Link
          href={slide.href}
          className="inline-flex items-center gap-2 self-start"
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: 10,
            border: "1px solid #FF6A00",
            boxShadow: "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
            color: "#FF6A00",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Shop now
          <ArrowRight size={16} color="#FF6A00" />
        </Link>
      </div>

      {/* Right product images grid (only for "Trending" slide) */}
      {current === 0 && trendingThumbs.length > 0 && (
        <div
          className="absolute grid grid-cols-2 gap-3"
          style={{ right: 80, top: "50%", transform: "translateY(-50%)", width: 340 }}
        >
          {trendingThumbs.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="block" title={p.name} aria-label={p.name}>
              <img
                src={p.imageUrl}
                alt={p.name}
                className="object-cover hover:scale-105 transition-transform duration-300"
                style={{ width: "100%", height: 150, borderRadius: 10 }}
              />
            </Link>
          ))}
        </div>
      )}

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          left: 20,
          top: "50%",
          transform: "translateY(-50%)",
          background: "#FFFFFF",
          border: "1px solid #FF6A00",
          boxShadow: "2px 2px 2px rgba(0,0,0,0.1)",
          borderRadius: 30,
        }}
      >
        <ArrowLeft size={24} color="#FF6A00" />
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          background: "#FFFFFF",
          border: "1px solid #FF6A00",
          boxShadow: "2px 2px 2px rgba(0,0,0,0.1)",
          borderRadius: 30,
        }}
      >
        <ArrowRight size={24} color="#FF6A00" />
      </button>

      {/* Dots */}
      <div
        className="absolute flex flex-row gap-2 items-center justify-center"
        style={{ bottom: 16, left: "50%", transform: "translateX(-50%)" }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? "#FF6A00" : "rgba(255,255,255,0.6)",
              transition: "all 0.3s",
              border: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
