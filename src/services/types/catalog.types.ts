/**
 * Catalog service request/response types.
 * Re-exports from shared catalog types where applicable.
 */

import type {
  CategoryItem,
  ProductListItem,
  ProductDetail,
  ReviewItem,
  ProductQuestionItem,
} from "@/types/catalog";

export type { CategoryItem, ProductListItem, ProductDetail, ReviewItem, ProductQuestionItem };

export interface GetProductsParams {
  categorySlug?: string;
  subCategorySlug?: string;
  limit?: number;
  offset?: number;
}
