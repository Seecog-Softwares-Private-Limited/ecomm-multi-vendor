"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/components/ui/dialog";

type ReviewPhotoGalleryProps = {
  photos: string[];
  open: boolean;
  initialIndex?: number;
  onOpenChange: (open: boolean) => void;
};

export function ReviewPhotoGallery({
  photos,
  open,
  initialIndex = 0,
  onOpenChange,
}: ReviewPhotoGalleryProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext]);

  useEffect(() => {
    if (!open || photos.length <= 1) return;

    let touchStartX = 0;
    const SWIPE_THRESHOLD = 48;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0]?.clientX ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0]?.clientX ?? 0;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      if (delta > 0) goPrev();
      else goNext();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, photos.length, goPrev, goNext]);

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-0 bg-black/95 p-0 text-white sm:rounded-xl">
        <DialogTitle className="sr-only">Review photo gallery</DialogTitle>
        <div className="relative flex min-h-[50vh] items-center justify-center p-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 sm:left-4"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 sm:right-14"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          )}

          <div className="relative flex h-[min(70vh,480px)] w-full max-w-2xl items-center justify-center">
            <ProductImage
              src={photos[index]}
              alt={`Review photo ${index + 1} of ${photos.length}`}
              className="max-h-[min(70vh,480px)] max-w-full object-contain"
            />
          </div>

          {photos.length > 1 && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {index + 1} / {photos.length}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
