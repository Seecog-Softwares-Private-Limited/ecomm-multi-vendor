"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HomeBannerSkeleton } from "@/components/home/HomeSkeletons";

type HeroSlide = {
  image: string;
  overlay: string;
  label: string;
  headline: string;
  subline?: string;
  href: string;
};

const SLIDES: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1760624294469-550753ec203a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay:
      "linear-gradient(90deg, rgba(255,106,0,0.88) 0%, rgba(255,106,0,0.55) 55%, rgba(255,106,0,0.2) 100%)",
    label: "See What's",
    headline: "Trending",
    href: "/category/best-sellers",
  },
  {
    image:
      "https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "linear-gradient(90deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.35) 100%)",
    label: "New Arrivals",
    headline: "Up to 60% Off",
    subline: "From Casual to Festive — Everything You Love",
    href: "/category/new-arrivals",
  },
  {
    image:
      "https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "linear-gradient(90deg, rgba(30,81,40,0.85) 0%, rgba(45,122,62,0.45) 100%)",
    label: "Welcome Offer",
    headline: "Up to 70% Off",
    subline: "Across categories — limited time",
    href: "/category/deals",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595051665600-afd01ea7c446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "linear-gradient(90deg, rgba(219,39,119,0.8) 0%, rgba(192,38,211,0.4) 100%)",
    label: "Glow Up Sale",
    headline: "Beauty & Skincare",
    subline: "Starting ₹199 — shop bestsellers",
    href: "/category/beauty",
  },
];

const AUTO_MS = 4500;

export const HomeHeroCarousel = memo(function HomeHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const pausedRef = useRef(false);

  const goTo = useCallback((index: number) => {
    setImageLoaded(false);
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || pausedRef.current) return;
    const id = window.setInterval(() => {
      setImageLoaded(false);
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [ready, current]);

  const slide = SLIDES[current];

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
    touchDeltaX.current = 0;
    pausedRef.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 48) {
      if (touchDeltaX.current > 0) prev();
      else next();
    }
    window.setTimeout(() => {
      pausedRef.current = false;
    }, AUTO_MS);
  };

  if (!ready) {
    return (
      <section aria-label="Promotional banners" className="home-section-enter py-3 sm:py-4">
        <HomeBannerSkeleton />
      </section>
    );
  }

  return (
    <section aria-label="Promotional banners" className="home-section-enter py-3 sm:py-4">
      <div className="relative mx-auto w-full max-w-[1440px] px-3 sm:px-4 lg:px-6">
        <div
          className="relative overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <div className="relative aspect-[2.2/1] w-full sm:aspect-[2.8/1] lg:aspect-[3.2/1]">
            <img
              key={slide.image}
              src={slide.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />
            {!imageLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-slate-200"
                aria-hidden="true"
              />
            )}

            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ background: slide.overlay }}
              aria-hidden
            />

            <Link
              href={slide.href}
              className="absolute inset-0 z-[2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
              aria-label={`${slide.label} ${slide.headline}. Shop now`}
            >
              <span className="sr-only">
                {slide.label} {slide.headline}
                {slide.subline ? ` — ${slide.subline}` : ""}
              </span>
            </Link>

            <div className="pointer-events-none absolute left-4 top-1/2 z-[3] max-w-[72%] -translate-y-1/2 sm:left-8 lg:left-12 lg:max-w-[55%]">
              <p className="text-lg font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl">
                {slide.label}
              </p>
              <p className="text-3xl font-extrabold leading-none text-white sm:text-5xl lg:text-7xl">
                {slide.headline}
              </p>
              {slide.subline && (
                <p className="mt-2 max-w-md text-sm font-semibold leading-snug text-white/90 sm:text-base lg:text-xl">
                  {slide.subline}
                </p>
              )}
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#FF6A00] bg-white/95 px-3 py-2 text-sm font-semibold text-[#FF6A00] shadow-sm">
                Shop now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-md transition hover:bg-white sm:flex"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-md transition hover:bg-white sm:flex"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5"
            role="tablist"
            aria-label="Banner slides"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/80"
                style={{
                  width: i === current ? 22 : 8,
                  background: i === current ? "#FF6A00" : "rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
