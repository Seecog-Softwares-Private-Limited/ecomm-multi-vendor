/**
 * Stable storefront placeholder for products missing or broken images.
 * Served from /public so it works offline and needs no remotePatterns.
 */
export const DEFAULT_PRODUCT_IMAGE_URL = "/images/product-placeholder.svg";

export function resolveProductImageUrl(url: string | null | undefined): string {
  const u = typeof url === "string" ? url.trim() : "";
  return u.length > 0 ? u : DEFAULT_PRODUCT_IMAGE_URL;
}

/** PDP gallery: never return an empty list. */
export function ensureProductImageList(urls: string[]): string[] {
  const cleaned = urls.map((u) => u.trim()).filter(Boolean);
  if (cleaned.length === 0) return [DEFAULT_PRODUCT_IMAGE_URL];
  return cleaned;
}
