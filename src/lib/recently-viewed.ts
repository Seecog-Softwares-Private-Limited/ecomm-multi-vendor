export const RECENTLY_VIEWED_KEY = "recently_viewed_product_ids";

function safeParseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  return safeParseIds(window.localStorage.getItem(RECENTLY_VIEWED_KEY));
}

export function addRecentlyViewedId(productId: string, max: number = 20): void {
  if (typeof window === "undefined") return;
  const id = typeof productId === "string" ? productId.trim() : "";
  if (!id) return;

  const current = getRecentlyViewedIds();
  const next = [id, ...current.filter((x) => x !== id)].slice(0, Math.max(1, max));
  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}

