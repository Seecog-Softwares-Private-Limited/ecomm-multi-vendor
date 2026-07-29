import type { ReviewItem } from "@/types/catalog";

export type ReviewSort = "newest" | "highest" | "lowest" | "helpful";

export type ReviewFilters = {
  stars: Set<number>;
  verifiedOnly: boolean;
  withPhotosOnly: boolean;
};

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  stars: new Set(),
  verifiedOnly: false,
  withPhotosOnly: false,
};

export type ProductReview = ReviewItem & {
  photoUrls: string[];
};

export const REVIEW_SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest Rating" },
  { value: "lowest", label: "Lowest Rating" },
  { value: "helpful", label: "Most Helpful" },
];

const REVIEWS_FETCH_LIMIT = 100;
const REVIEWS_PAGE_SIZE = 10;

export { REVIEWS_FETCH_LIMIT, REVIEWS_PAGE_SIZE };

export function normalizeReview(raw: ReviewItem): ProductReview {
  const photoUrls =
    raw.photoUrls ??
    (Array.isArray((raw as { photos?: string[] }).photos)
      ? (raw as { photos: string[] }).photos
      : []);

  return {
    ...raw,
    photoUrls,
  };
}

export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function formatReviewDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export function computeRatingDistribution(reviews: ProductReview[]): RatingDistribution {
  const counts: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) as keyof RatingDistribution;
    counts[bucket] += 1;
  }
  return counts;
}

export function sortReviews(reviews: ProductReview[], sort: ReviewSort): ProductReview[] {
  const list = [...reviews];
  switch (sort) {
    case "highest":
      return list.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date));
    case "lowest":
      return list.sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date));
    case "helpful":
      return list.sort((a, b) => b.helpful - a.helpful || b.date.localeCompare(a.date));
    case "newest":
    default:
      return list.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export function filterReviews(reviews: ProductReview[], filters: ReviewFilters): ProductReview[] {
  return reviews.filter((review) => {
    if (filters.stars.size > 0 && !filters.stars.has(Math.round(review.rating))) {
      return false;
    }
    if (filters.verifiedOnly && !review.verified) return false;
    if (filters.withPhotosOnly && review.photoUrls.length === 0) return false;
    return true;
  });
}

export function hasActiveReviewFilters(filters: ReviewFilters): boolean {
  return filters.stars.size > 0 || filters.verifiedOnly || filters.withPhotosOnly;
}

export function countReviewsWithPhotos(reviews: ProductReview[]): number {
  return reviews.filter((r) => r.photoUrls.length > 0).length;
}
