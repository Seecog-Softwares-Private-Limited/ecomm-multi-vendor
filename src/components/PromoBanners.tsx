"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PromoCard {
  gradient: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  href: string;
}

const promoCards: PromoCard[] = [
  {
    gradient: "linear-gradient(135deg, #1E5128 0%, #2D7A3E 100%)",
    title: "Furniture, Décor & Essentials",
    subtitle: "Flat 40% Off + Extra Cashback",
    cta: "Make It Yours",
    image: "https://images.unsplash.com/photo-1765766601447-9e11ad2356da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/home",
  },
  {
    gradient: "linear-gradient(135deg, #FF6A00 0%, #FF8533 100%)",
    title: "Fitness Gear Starting ₹499",
    subtitle: "Up to 55% Off",
    cta: "Get Game Ready",
    image: "https://images.unsplash.com/photo-1722925541311-2117dfa21fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/sports",
  },
  {
    gradient: "linear-gradient(135deg, #2F6BFF 0%, #5285FF 100%)",
    title: "Welcome Offer",
    subtitle: "Up to 70% Off Across Categories",
    cta: "Explore Now",
    image: "https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/deals",
  },
  {
    gradient: "linear-gradient(135deg, #FFC247 0%, #FFD470 100%)",
    title: "New Arrivals Dropped",
    subtitle: "From Casual to Festive — Everything You Love",
    cta: "Shop the Look",
    image: "https://images.unsplash.com/photo-1759840279499-f9de9764b2cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/new-arrivals",
  },
  {
    gradient: "linear-gradient(135deg, #FF4D4D 0%, #FF7070 100%)",
    title: "Glow Up Sale",
    subtitle: "Skincare, Makeup & Grooming — Buy More. Save More.",
    cta: "Glow Now",
    image: "https://images.unsplash.com/photo-1595051665600-afd01ea7c446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
    href: "/category/beauty",
  },
];

const CARD_STEP = 320 + 12;

export function PromoBanners() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(CARD_STEP, Math.min(CARD_STEP * 2, Math.floor(el.clientWidth * 0.75)));
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative w-full px-2 sm:px-4">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 shadow-lg backdrop-blur transition hover:bg-white sm:left-4 sm:h-10 sm:w-10"
        aria-label="Scroll promotions left"
      >
        <ChevronLeft size={20} color="#374151" />
      </button>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 shadow-lg backdrop-blur transition hover:bg-white sm:right-4 sm:h-10 sm:w-10"
        aria-label="Scroll promotions right"
      >
        <ChevronRight size={20} color="#374151" />
      </button>

      <div
        ref={scrollRef}
        className="w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="flex w-max flex-row gap-3 px-6 py-1 sm:px-8"
        >
          {promoCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="relative block h-[200px] w-[min(82vw,320px)] snap-start overflow-hidden rounded-xl no-underline text-inherit transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6A00] sm:w-[320px]"
              style={{
                borderRadius: 12,
                background: card.gradient,
              }}
              aria-label={`${card.title}. ${card.subtitle}. ${card.cta}`}
            >
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ opacity: 0.2, borderRadius: 12 }}
                draggable={false}
              />

              <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
                <div>
                  <p
                    style={{
                      fontFamily: "'Nunito', 'Manrope', sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      lineHeight: "34px",
                      color: "#FFFFFF",
                    }}
                  >
                    {card.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: "21px",
                      color: "rgba(255,255,255,0.9)",
                      marginTop: 0,
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>

                <span
                  className="flex flex-row items-center gap-1.5 self-start w-fit"
                  style={{
                    padding: "9px 17px",
                    background: "rgba(255,255,255,0.95)",
                    boxShadow:
                      "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
                    borderRadius: 9,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 500,
                      fontSize: 18,
                      color: "#FF6A00",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.cta}
                  </span>
                  <ArrowRight size={15} color="#FF6A00" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
