"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PRODUCT_IMAGE_URL } from "@/lib/product-image";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders a product thumbnail; falls back to the local placeholder when the URL is missing or fails to load.
 */
export function ProductImage({ src, alt, className, style }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = typeof src === "string" ? src.trim() : "";
  const url =
    failed || !trimmed ? DEFAULT_PRODUCT_IMAGE_URL : trimmed;

  useEffect(() => {
    setFailed(false);
  }, [trimmed]);

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
