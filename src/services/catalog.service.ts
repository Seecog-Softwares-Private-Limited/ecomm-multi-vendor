/**
 * Catalog service — typed API calls for categories and products.
 * Use this from UI instead of calling fetch directly.
 */

import { request } from "./client";
import type {
  CategoryItem,
  ProductListItem,
  ProductDetail,
  ReviewItem,
  ProductQuestionItem,
  GetProductsParams,
} from "./types/catalog.types";

const API_BASE = "/api";

export const catalogService = {
  /** List all categories. */
  async getCategories(): Promise<CategoryItem[]> {
    return request<CategoryItem[]>(`${API_BASE}/categories`, { method: "GET" });
  },

  /** List products with optional filters and pagination. */
  async getProducts(params: GetProductsParams = {}): Promise<ProductListItem[]> {
    const search = new URLSearchParams();
    if (params.categorySlug) search.set("categorySlug", params.categorySlug);
    if (params.subCategorySlug) search.set("subCategorySlug", params.subCategorySlug);
    if (params.limit != null) search.set("limit", String(params.limit));
    if (params.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    const path = qs ? `${API_BASE}/products?${qs}` : `${API_BASE}/products`;
    return request<ProductListItem[]>(path, { method: "GET" });
  },

  /** Get a single product by id. */
  async getProductById(id: string): Promise<ProductDetail> {
    return request<ProductDetail>(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  },

  /** Get reviews for a product. */
  async getProductReviews(productId: string, limit?: number): Promise<ReviewItem[]> {
    const path =
      limit != null
        ? `${API_BASE}/products/${encodeURIComponent(productId)}/reviews?limit=${limit}`
        : `${API_BASE}/products/${encodeURIComponent(productId)}/reviews`;
    return request<ReviewItem[]>(path, { method: "GET" });
  },

  /** Get Q&A for a product. */
  async getProductQuestions(productId: string, limit?: number): Promise<ProductQuestionItem[]> {
    const path =
      limit != null
        ? `${API_BASE}/products/${encodeURIComponent(productId)}/questions?limit=${limit}`
        : `${API_BASE}/products/${encodeURIComponent(productId)}/questions`;
    return request<ProductQuestionItem[]>(path, { method: "GET" });
  },
};
