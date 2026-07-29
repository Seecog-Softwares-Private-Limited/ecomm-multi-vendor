import { prisma } from "@/lib/prisma";
import { sanitizePlainText } from "@/lib/text-sanitize";

export type ReviewSummary = {
  avgRating: number;
  reviewCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type CreatedReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: string;
};

async function refreshProductReviewStats(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string
): Promise<void> {
  const agg = await tx.review.aggregate({
    where: { productId, deletedAt: null },
    _avg: { rating: true },
    _count: { id: true },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating ?? null,
      reviewCount: agg._count.id,
    },
  });
}

export async function userHasDeliveredProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: "DELIVERED" },
    },
    select: { id: true },
  });
  return item != null;
}

export async function createProductReview(
  userId: string,
  productId: string,
  rating: number,
  comment: string
): Promise<CreatedReview | "NOT_ELIGIBLE" | "DUPLICATE" | "NOT_FOUND"> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null, status: "ACTIVE" },
    select: { id: true },
  });
  if (!product) return "NOT_FOUND";

  const eligible = await userHasDeliveredProduct(userId, productId);
  if (!eligible) return "NOT_ELIGIBLE";

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true, deletedAt: true },
  });
  if (existing && existing.deletedAt == null) return "DUPLICATE";

  const safeComment = sanitizePlainText(comment, 2000);

  const review = await prisma.$transaction(async (tx) => {
    let row;
    if (existing?.deletedAt) {
      row = await tx.review.update({
        where: { id: existing.id },
        data: {
          rating,
          comment: safeComment || null,
          verified: true,
          deletedAt: null,
          updatedAt: new Date(),
        },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
    } else {
      row = await tx.review.create({
        data: {
          productId,
          userId,
          rating,
          comment: safeComment || null,
          verified: true,
        },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
    }

    await refreshProductReviewStats(tx, productId);
    return row;
  });

  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    verified: review.verified,
    helpfulCount: review.helpfulCount ?? 0,
    createdAt: review.createdAt.toISOString(),
    user: [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") || "User",
  };
}

export async function getProductReviewSummary(productId: string): Promise<ReviewSummary> {
  const [groups, product] = await Promise.all([
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId, deletedAt: null },
      _count: { id: true },
    }),
    prisma.product.findUnique({
      where: { id: productId },
      select: { avgRating: true, reviewCount: true },
    }),
  ]);

  const distribution: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalFromGroups = 0;
  let weightedSum = 0;

  for (const g of groups) {
    const star = g.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) {
      distribution[star] = g._count.id;
      totalFromGroups += g._count.id;
      weightedSum += star * g._count.id;
    }
  }

  const reviewCount =
    product?.reviewCount != null && product.reviewCount > 0
      ? product.reviewCount
      : totalFromGroups;

  const avgRating =
    product?.avgRating != null && Number(product.avgRating) > 0
      ? Number(product.avgRating)
      : totalFromGroups > 0
        ? weightedSum / totalFromGroups
        : 0;

  return {
    avgRating: Math.round(avgRating * 100) / 100,
    reviewCount,
    distribution,
  };
}

export async function toggleReviewHelpfulVote(
  userId: string,
  reviewId: string
): Promise<
  | { helpfulCount: number; voted: boolean }
  | "NOT_FOUND"
  | "FORBIDDEN"
> {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, deletedAt: null },
    select: { id: true, userId: true, helpfulCount: true },
  });
  if (!review) return "NOT_FOUND";
  if (review.userId === userId) return "FORBIDDEN";

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.reviewHelpfulVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
      select: { id: true },
    });

    if (existing) {
      await tx.reviewHelpfulVote.delete({ where: { id: existing.id } });
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
        select: { helpfulCount: true },
      });
      return {
        helpfulCount: Math.max(0, updated.helpfulCount ?? 0),
        voted: false,
      };
    }

    await tx.reviewHelpfulVote.create({ data: { reviewId, userId } });
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
      select: { helpfulCount: true },
    });
    return { helpfulCount: updated.helpfulCount ?? 1, voted: true };
  });

  return result;
}
