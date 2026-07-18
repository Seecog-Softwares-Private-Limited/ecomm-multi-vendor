/**
 * Normalizes avatar/image paths from the API for browser display.
 * Supports absolute URLs and same-origin paths (e.g. `/uploads/...`).
 */
export function resolveImageUrl(raw: string | null | undefined): string | null {
  const url = raw?.trim() ?? "";
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}
