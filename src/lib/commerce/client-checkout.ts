/** Browser helpers for checkout session flow. */

export type CheckoutSessionPreview = {
  session: {
    id: string;
    type: string;
    status: string;
    cartVersion: number;
    expiresAt: string;
    orderId: string | null;
  };
  items: Array<{
    id: string;
    cartItemId: string | null;
    productId: string;
    productName: string;
    imageUrl: string;
    variantKey: string | null;
    quantity: number;
    unitSellingPrice: number;
    lineTotal: number;
  }>;
  totals: {
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  coupon?: {
    code: string;
    valid: boolean;
    message: string | null;
    couponId: string | null;
  } | null;
  cartStale: boolean;
  requiresPriceConfirmation: boolean;
  priceChanges: Array<{
    productName: string;
    oldUnitPrice: number;
    newUnitPrice: number;
  }>;
};

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function createBuyNowSession(
  productId: string,
  quantity: number,
  variantKey: string | null
): Promise<{ sessionId: string }> {
  const res = await fetch("/api/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      type: "BUY_NOW",
      lines: [{ productId, quantity, variantKey }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Could not start checkout.");
  }
  return { sessionId: data.data.sessionId as string };
}

export async function createCartCheckoutSession(
  cartItemIds: string[]
): Promise<{ sessionId: string }> {
  const res = await fetch("/api/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ type: "CART", cartItemIds }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Could not start checkout.");
  }
  return { sessionId: data.data.sessionId as string };
}

export async function fetchCheckoutSession(
  sessionId: string,
  couponCode?: string
): Promise<CheckoutSessionPreview> {
  const qs = couponCode?.trim() ? `?couponCode=${encodeURIComponent(couponCode.trim())}` : "";
  const res = await fetch(`/api/checkout/sessions/${sessionId}${qs}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Could not load checkout.");
  }
  return data.data as CheckoutSessionPreview;
}

export async function confirmCheckoutPrices(sessionId: string): Promise<void> {
  const res = await fetch(`/api/checkout/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "confirm_prices" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Could not confirm prices.");
  }
}

export async function mergeGuestCart(
  items: Array<{ productId: string; quantity: number; variantKey?: string | null }>
): Promise<void> {
  if (items.length === 0) return;
  await fetch("/api/cart/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items }),
  });
}
