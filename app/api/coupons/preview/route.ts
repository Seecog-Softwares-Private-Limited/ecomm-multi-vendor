import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { applyCouponToSubtotal } from "@/lib/commerce/pricing";
import { normalizeCouponCode } from "@/lib/admin/coupons";

/**
 * POST /api/coupons/preview — soft-validate a coupon against a cart subtotal.
 * Body: { code: string, subtotal: number }
 * Does not consume the coupon. Auth optional (per-user limits checked when logged in).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));
  const code = normalizeCouponCode((body as { code?: unknown }).code);
  const subtotalRaw = (body as { subtotal?: unknown }).subtotal;
  const subtotal =
    typeof subtotalRaw === "number"
      ? subtotalRaw
      : typeof subtotalRaw === "string"
        ? Number(subtotalRaw)
        : NaN;

  if (!code) {
    return apiBadRequest("Coupon code is required.");
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return apiBadRequest("A valid cart subtotal is required.");
  }

  const session = await getSession(request);
  const userId = session?.role === "CUSTOMER" ? session.sub : null;

  try {
    const coupon = await applyCouponToSubtotal(code, subtotal, { userId });
    return apiSuccess({
      code: coupon.couponCode,
      valid: true,
      discountAmount: coupon.discountAmount,
      couponId: coupon.couponId,
      message: null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const message =
      msg === "COUPON_EXhausted"
        ? "This coupon has reached its usage limit."
        : msg === "COUPON_USER_LIMIT"
          ? "You have already used this coupon the maximum number of times."
          : "Invalid or expired coupon code";
    return apiSuccess({
      code,
      valid: false,
      discountAmount: 0,
      couponId: null,
      message,
    });
  }
});
