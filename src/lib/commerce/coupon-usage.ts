import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

export type CouponLimitFields = {
  id: string;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usedCount: number | null;
};

/**
 * Orders that successfully consumed a coupon (matches usedCount increment rules):
 * - Online: payment marked PAID (increment happens on payment confirm)
 * - COD: order placed with COD payment (increment happens on place; status is never PENDING_PAYMENT)
 * Failed/cancelled unpaid online orders are excluded.
 */
export function successfulCouponRedemptionWhere(
  couponId: string,
  userId: string,
  excludeOrderId?: string | null
): Prisma.OrderWhereInput {
  return {
    couponId,
    userId,
    ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
    OR: [
      { payments: { some: { status: "PAID" } } },
      {
        AND: [
          { payments: { some: { mode: "COD" } } },
          { status: { not: "PENDING_PAYMENT" } },
        ],
      },
    ],
  };
}

export async function countSuccessfulCouponRedemptions(
  db: DbClient,
  couponId: string,
  userId: string,
  excludeOrderId?: string | null
): Promise<number> {
  return db.order.count({
    where: successfulCouponRedemptionWhere(couponId, userId, excludeOrderId),
  });
}

export function isGlobalCouponExhausted(coupon: Pick<CouponLimitFields, "maxUses" | "usedCount">): boolean {
  return coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses;
}

export function isPerUserCouponExhausted(
  coupon: Pick<CouponLimitFields, "maxUsesPerUser">,
  userRedemptionCount: number
): boolean {
  return coupon.maxUsesPerUser != null && userRedemptionCount >= coupon.maxUsesPerUser;
}

/**
 * Soft pre-check used by preview / early place validation.
 * Hard enforcement happens in consumeCouponUse under row lock.
 */
export async function assertCouponLimitsForUser(
  coupon: CouponLimitFields,
  userId: string | null | undefined,
  db: DbClient = prisma
): Promise<void> {
  if (isGlobalCouponExhausted(coupon)) {
    throw new Error("COUPON_EXhausted");
  }
  if (!userId || coupon.maxUsesPerUser == null) return;
  const used = await countSuccessfulCouponRedemptions(db, coupon.id, userId);
  if (isPerUserCouponExhausted(coupon, used)) {
    throw new Error("COUPON_USER_LIMIT");
  }
}

async function lockCouponRow(tx: Prisma.TransactionClient, couponId: string): Promise<void> {
  await tx.$executeRaw`SELECT id FROM coupons WHERE id = ${couponId} FOR UPDATE`;
}

/**
 * Atomically consume one coupon use. Call inside an open transaction after the
 * consuming order row exists (or with excludeOrderId pointing at it).
 * Locks the coupon row so concurrent checkouts cannot both take the last slot.
 */
export async function consumeCouponUse(
  tx: Prisma.TransactionClient,
  params: {
    couponId: string;
    userId: string;
    /** Exclude the order currently consuming the coupon from the per-user count. */
    orderId: string;
  }
): Promise<void> {
  await lockCouponRow(tx, params.couponId);

  const coupon = await tx.coupon.findUnique({
    where: { id: params.couponId },
    select: { id: true, maxUses: true, maxUsesPerUser: true, usedCount: true },
  });
  if (!coupon) {
    throw new Error("COUPON_INVALID");
  }

  if (isGlobalCouponExhausted(coupon)) {
    throw new Error("COUPON_EXhausted");
  }

  if (coupon.maxUsesPerUser != null) {
    const used = await countSuccessfulCouponRedemptions(
      tx,
      params.couponId,
      params.userId,
      params.orderId
    );
    if (isPerUserCouponExhausted(coupon, used)) {
      throw new Error("COUPON_USER_LIMIT");
    }
  }

  // Conditional increment: refuse if another session raced past maxUses.
  const updated = await tx.$executeRaw`
    UPDATE coupons
    SET used_count = COALESCE(used_count, 0) + 1,
        updated_at = CURRENT_TIMESTAMP(3)
    WHERE id = ${params.couponId}
      AND (max_uses IS NULL OR COALESCE(used_count, 0) < max_uses)
  `;
  if (Number(updated) === 0) {
    throw new Error("COUPON_EXhausted");
  }
}
