/** Persist applied cart coupon across cart → checkout navigation. */

export const CART_COUPON_STORAGE_KEY = "indovyapar.appliedCoupon";

export type StoredCartCoupon = {
  code: string;
  discountAmount: number;
};

export function readStoredCartCoupon(): StoredCartCoupon | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CART_COUPON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCartCoupon>;
    const code = typeof parsed.code === "string" ? parsed.code.trim() : "";
    const discountAmount =
      typeof parsed.discountAmount === "number" && Number.isFinite(parsed.discountAmount)
        ? parsed.discountAmount
        : NaN;
    if (!code || !Number.isFinite(discountAmount) || discountAmount < 0) return null;
    return { code, discountAmount };
  } catch {
    return null;
  }
}

export function writeStoredCartCoupon(coupon: StoredCartCoupon | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!coupon) {
      sessionStorage.removeItem(CART_COUPON_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(CART_COUPON_STORAGE_KEY, JSON.stringify(coupon));
  } catch {
    // sessionStorage may be unavailable
  }
}

export async function previewCoupon(
  code: string,
  subtotal: number
): Promise<{
  code: string;
  valid: boolean;
  discountAmount: number;
  message: string | null;
}> {
  const res = await fetch("/api/coupons/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      code: code.trim().toUpperCase(),
      valid: false,
      discountAmount: 0,
      message: data?.error?.message ?? "Could not validate coupon.",
    };
  }
  const payload = data?.data ?? {};
  return {
    code: typeof payload.code === "string" ? payload.code : code.trim().toUpperCase(),
    valid: payload.valid === true,
    discountAmount:
      typeof payload.discountAmount === "number" && Number.isFinite(payload.discountAmount)
        ? payload.discountAmount
        : 0,
    message: typeof payload.message === "string" ? payload.message : null,
  };
}
