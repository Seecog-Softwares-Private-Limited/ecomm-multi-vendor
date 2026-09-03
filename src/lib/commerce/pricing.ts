import { prisma } from "@/lib/prisma";
import { DEFAULT_GST_PERCENT } from "@/lib/constants/gst";
import { calculateShippingAmount } from "@/lib/constants/shipping";
import { assertCouponLimitsForUser } from "@/lib/commerce/coupon-usage";

export type PricedCheckoutLine = {
  productId: string;
  sellerId: string;
  variantKey: string | null;
  quantity: number;
  unitSellingPrice: number;
  unitMrp: number | null;
  gstPercent: number;
  cartItemId?: string | null;
};

export type CheckoutTotals = {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponId: string | null;
  couponCode: string | null;
};

export type PriceChangeLine = {
  productId: string;
  variantKey: string | null;
  productName: string;
  oldUnitPrice: number;
  newUnitPrice: number;
};

export function computeLineSubtotal(lines: PricedCheckoutLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitSellingPrice * l.quantity, 0);
}

export function computeTaxAmount(lines: PricedCheckoutLine[]): number {
  return lines.reduce((sum, l) => {
    const gst = l.gstPercent ?? DEFAULT_GST_PERCENT;
    return sum + l.unitSellingPrice * l.quantity * (gst / 100);
  }, 0);
}

export async function applyCouponToSubtotal(
  couponCode: string | null | undefined,
  subtotal: number,
  options?: { userId?: string | null }
): Promise<{ discountAmount: number; couponId: string | null; couponCode: string | null }> {
  if (!couponCode?.trim()) {
    return { discountAmount: 0, couponId: null, couponCode: null };
  }

  const code = couponCode.trim();
  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      deletedAt: null,
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() },
    },
  });

  if (!coupon) {
    throw new Error("COUPON_INVALID");
  }

  await assertCouponLimitsForUser(
    {
      id: coupon.id,
      maxUses: coupon.maxUses,
      maxUsesPerUser: coupon.maxUsesPerUser,
      usedCount: coupon.usedCount,
    },
    options?.userId
  );

  const val = Number(coupon.discountValue);
  const discountAmount =
    coupon.discountType === "PERCENT" ? (subtotal * val) / 100 : Math.min(val, subtotal);

  return { discountAmount, couponId: coupon.id, couponCode: code };
}

export function buildCheckoutTotals(
  lines: PricedCheckoutLine[],
  discountAmount: number,
  couponId: string | null,
  couponCode: string | null
): CheckoutTotals {
  const subtotal = computeLineSubtotal(lines);
  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingAmount = calculateShippingAmount(amountAfterDiscount);
  const taxAmount = computeTaxAmount(lines);
  const totalAmount = amountAfterDiscount + shippingAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    shippingAmount,
    taxAmount,
    totalAmount,
    couponId,
    couponCode,
  };
}

export function detectPriceChanges(
  sessionLines: Array<{
    productId: string;
    variantKey: string | null;
    unitSellingPrice: number;
    productName: string;
  }>,
  liveLines: Array<{
    productId: string;
    variantKey: string | null;
    liveUnitPrice: number;
    productName: string;
  }>
): PriceChangeLine[] {
  const changes: PriceChangeLine[] = [];
  for (const sessionLine of sessionLines) {
    const live = liveLines.find(
      (l) =>
        l.productId === sessionLine.productId &&
        (l.variantKey ?? null) === (sessionLine.variantKey ?? null)
    );
    if (!live) continue;
    const oldP = sessionLine.unitSellingPrice;
    const newP = live.liveUnitPrice;
    if (Math.abs(oldP - newP) >= 0.01) {
      changes.push({
        productId: sessionLine.productId,
        variantKey: sessionLine.variantKey,
        productName: sessionLine.productName,
        oldUnitPrice: oldP,
        newUnitPrice: newP,
      });
    }
  }
  return changes;
}

export function formatPriceChangeMessage(changes: PriceChangeLine[]): string {
  if (changes.length === 0) return "";
  if (changes.length === 1) {
    const c = changes[0];
    return `Price changed from ₹${c.oldUnitPrice.toFixed(2)} to ₹${c.newUnitPrice.toFixed(2)} for ${c.productName}. Please review and confirm.`;
  }
  return `${changes.length} item prices have changed. Please review and confirm before paying.`;
}
