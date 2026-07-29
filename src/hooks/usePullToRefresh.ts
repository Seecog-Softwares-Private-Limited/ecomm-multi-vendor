"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UsePullToRefreshOptions = {
  onRefresh: () => Promise<void>;
  threshold?: number;
  enabled?: boolean;
};

export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const scrollYRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  const triggerRefresh = useCallback(async () => {
    if (refreshingRef.current) return;
    scrollYRef.current = window.scrollY;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollYRef.current });
      });
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const onTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 8 || refreshingRef.current) return;
      startYRef.current = event.touches[0]?.clientY ?? 0;
      pullingRef.current = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pullingRef.current || refreshingRef.current) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = Math.max(0, currentY - startYRef.current);
      if (delta > 0 && window.scrollY <= 8) {
        const next = Math.min(delta, threshold * 1.5);
        pullDistanceRef.current = next;
        setPullDistance(next);
        if (delta > 12) event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (pullDistanceRef.current >= threshold && !refreshingRef.current) {
        void triggerRefresh();
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, threshold, triggerRefresh]);

  const progress = Math.min(1, pullDistance / threshold);

  return { refreshing, pullDistance, progress };
}
