const STORAGE_KEY = "indovyapar_recent_searches";
const MAX_RECENT = 10;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed || typeof window === "undefined") return getRecentSearches();
  const deduped = [trimmed, ...getRecentSearches().filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
    0,
    MAX_RECENT
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
  } catch {
    // ignore quota errors
  }
  return deduped;
}

export function removeRecentSearch(term: string): string[] {
  if (typeof window === "undefined") return [];
  const next = getRecentSearches().filter((s) => s !== term);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
