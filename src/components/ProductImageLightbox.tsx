"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

type ProductImageLightboxProps = {
  images: string[];
  index: number;
  alt: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const ZOOM_SCALE = 2.5;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Fullscreen product image viewer: arrows / swipe / keyboard to move between images,
 * tap or click to zoom into the point that was tapped, and pan by moving the pointer.
 */
export function ProductImageLightbox({ images, index, alt, onIndexChange, onClose }: ProductImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  const go = (delta: number) => {
    if (count < 2) return;
    setZoomed(false);
    onIndexChange((index + delta + count) % count);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  });

  const originFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const iconButton =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} images`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={iconButton}
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
          >
            {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button type="button" className={iconButton} onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16">
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ cursor: zoomed ? "zoom-out" : "zoom-in", touchAction: zoomed ? "none" : "pan-y" }}
          onClick={(e) => {
            setOrigin(originFromEvent(e));
            setZoomed((z) => !z);
          }}
          onMouseMove={(e) => {
            if (zoomed) setOrigin(originFromEvent(e));
          }}
          onTouchStart={(e) => {
            touchStartX.current = zoomed ? null : e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? 1 : -1);
          }}
        >
          <ProductImage
            src={images[index]}
            alt={`${alt} — image ${index + 1}`}
            className="h-full w-full select-none object-contain"
            style={{
              transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transition: "transform 0.2s ease-out",
            }}
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${iconButton} absolute left-2 top-1/2 -translate-y-1/2 sm:left-4`}
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className={`${iconButton} absolute right-2 top-1/2 -translate-y-1/2 sm:right-4`}
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
