/**
 * Simple in-process TTL cache.
 * Prevents repeated DB hits for data that rarely changes
 * (category slugs, pincode settings, platform config).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function memCacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function memCacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Get from cache or compute + cache the result.
 * @param key   Cache key
 * @param ttlMs Time-to-live in milliseconds
 * @param fn    Async function to compute the value on cache miss
 */
export async function memCacheGetOrSet<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = memCacheGet<T>(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  memCacheSet(key, value, ttlMs);
  return value;
}

export function memCacheDelete(key: string): void {
  store.delete(key);
}

export function memCacheClear(): void {
  store.clear();
}
