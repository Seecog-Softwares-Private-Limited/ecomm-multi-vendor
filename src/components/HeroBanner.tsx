"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1760624294469-550753ec203a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "linear-gradient(90deg, rgba(255,106,0,0.85) 0%, rgba(255,106,0,0.65) 60%, rgba(255,106,0,0.3) 100%)",
    label: "See What's",
    headline: "Trending",
    subline: "",
    productImages: [
      "https://images.unsplash.com/photo-1760624294469-550753ec203a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
      "https://images.unsplash.com/photo-1760520338259-64e68f6850b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
      "https://images.unsplash.com/photo-1762690285055-fa80848e825b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
      "https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440",
    overlay: "rgba(0,0,0,0.45)",
    label: "New Arrivals Dropped.",
    headline: "Up to 60% Off",
    subline: "From Casual to Festive — Everything You Love",
    productImages: [],
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  const slide = slides[current];

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
      </div>

      {/* Right product images grid (only for "Trending" slide) */}
      {slide.productImages.length > 0 && (
        <div
          className="absolute grid grid-cols-2 gap-3"
          style={{ right: 80, top: "50%", transform: "translateY(-50%)", width: 340 }}
        >
          {slide.productImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="product"
              className="object-cover"
              style={{ width: "100%", height: 150, borderRadius: 10 }}
            />
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
