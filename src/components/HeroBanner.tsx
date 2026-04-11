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
    <div className="relative w-full overflow-hidden h-[260px] sm:h-[320px] lg:h-[430px]">
      {/* BG image */}
      <img
        key={current}
        src={slide.image}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover"
        aria-hidden
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: slide.overlay }}
      />

      {/* Full-slide tap target (below thumbs & nav controls) */}
      <Link
        href={slide.href}
        className="absolute inset-0 z-[2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
        aria-label={`${slide.label} ${slide.headline}. Shop now`}
      >
        <span className="sr-only">
          {slide.label} {slide.headline}
          {slide.subline ? ` ${slide.subline}` : ""} — shop now
        </span>
      </Link>

      {/* Left text — visual only; clicks fall through to full-slide Link */}
      <div className="absolute left-5 top-1/2 z-[3] flex max-w-[70%] -translate-y-1/2 flex-col gap-2 pointer-events-none sm:left-10 sm:gap-3 lg:left-[120px] lg:max-w-[55%] lg:gap-4">
        <p
          className="leading-tight text-[20px] sm:text-[30px] lg:text-[40px]"
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            color: "#FFFFFF",
          }}
        >
          {slide.label}
        </p>
        <p
          className="leading-tight text-[38px] sm:text-[60px] lg:text-[96px]"
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            color: "#FFFFFF",
            marginTop: -8,
          }}
        >
          {slide.headline}
        </p>
        {slide.subline && (
          <p
            className="text-sm leading-snug sm:text-base lg:text-2xl"
            style={{
              fontFamily: "'Nunito','Manrope',sans-serif",
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            {slide.subline}
          </p>
        )}

        <span
          className="inline-flex items-center gap-2 self-start"
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: 10,
            border: "1px solid #FF6A00",
            boxShadow: "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
            color: "#FF6A00",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Shop now
          <ArrowRight size={16} color="#FF6A00" aria-hidden />
        </span>
      </div>

      {/* Right product images grid (only for "Trending" slide) — above slide link */}
      {current === 0 && trendingThumbs.length > 0 && (
        <div
          className="absolute right-4 top-1/2 z-10 hidden w-[220px] -translate-y-1/2 grid grid-cols-2 gap-2 sm:grid md:w-[280px] lg:right-20 lg:w-[340px] lg:gap-3"
        >
          {trendingThumbs.map((p) => (
            <Link key={p.id} href={`/product/${p.slug ?? p.id}`} className="block" title={p.name} aria-label={p.name}>
              <img
                src={p.imageUrl}
                alt={p.name}
                className="object-cover hover:scale-105 transition-transform duration-300"
                style={{ width: "100%", height: 100, borderRadius: 10 }}
              />
            </Link>
          ))}
        </div>
      )}

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute hidden items-center justify-center sm:flex"
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
        type="button"
        onClick={next}
        className="absolute z-20 hidden items-center justify-center sm:flex"
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
        className="absolute z-20 flex flex-row gap-2 items-center justify-center"
        style={{ bottom: 16, left: "50%", transform: "translateX(-50%)" }}
      >
        {slides.map((_, i) => (
          <button
            type="button"
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
