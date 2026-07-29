"use client";

import { useCallback, useEffect, useState } from "react";
import { catalogService } from "@/services/catalog.service";
import {
  normalizeReview,
  REVIEWS_FETCH_LIMIT,
  type ProductReview,
} from "@/lib/reviews/review-utils";
import { REVIEW_FEATURES } from "@/lib/reviews/review-features";

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productId || !REVIEW_FEATURES.listReviews) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setError(false);
    setLoading(true);
    try {
      const data = await catalogService.getProductReviews(productId, REVIEWS_FETCH_LIMIT);
      setReviews((Array.isArray(data) ? data : []).map(normalizeReview));
    } catch {
      setError(true);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}
