import { memCacheDelete } from "@/lib/utils/mem-cache";

export function cartCacheKey(userId: string): string {
  return `cart:v1:${userId}`;
}

export function checkoutCacheKey(sessionId: string): string {
  return `checkout:v1:${sessionId}`;
}

export function invalidateCartCache(userId: string): void {
  memCacheDelete(cartCacheKey(userId));
}

export function invalidateCheckoutCache(sessionId: string): void {
  memCacheDelete(checkoutCacheKey(sessionId));
}
