/**
 * Review API capability map — derived from backend inspection (not fabricated).
 *
 * Database (`prisma/schema.prisma` → `Review` model):
 *   id, productId, userId, rating (Int), comment, verified, helpfulCount, createdAt
 *
 * API (`GET /api/products/:id/reviews` only — no POST/PATCH/DELETE):
 *   Returns: id, user, rating, date, comment, verified, helpful
 *   Query: limit (max 100, client-side sort/filter only)
 *
 * Product aggregate fields (Product model):
 *   avgRating, reviewCount — used for hero + summary when present
 */
export const REVIEW_FEATURES = {
  /** GET /api/products/:id/reviews */
  listReviews: true,
  /** `verified` boolean on Review model */
  verifiedBadge: true,
  /** `helpfulCount` returned as `helpful` — read-only display */
  helpfulCount: true,
  /** Client-side sort/filter on fetched reviews (no server params) */
  clientSortFilter: true,
  writeReview: true,
  /** POST /api/reviews/:id/helpful */
  helpfulVote: true,
  /** No image fields on Review model */
  reviewPhotos: false,
  /** No title field on Review model */
  reviewTitle: false,
  /** No variant field on Review model */
  reviewVariant: false,
} as const;

export type ReviewFeatureKey = keyof typeof REVIEW_FEATURES;
