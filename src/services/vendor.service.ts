/**
 * Vendor service — typed API calls for vendor dashboard (products, etc.).
 * Use from UI; requires authenticated session (cookie).
 */

import { request, getBaseUrl } from "./client";
import { ServiceError } from "./errors";
import type {
  VendorProductListItem,
  CreateVendorProductPayload,
  CreateVendorProductResponse,
  VendorProductForEdit,
  UpdateVendorProductPayload,
} from "./types/vendor.types";

const VENDOR_BASE = "/api/vendor";

export const vendorService = {
  /** List products for the logged-in vendor. */
  async getProducts(): Promise<VendorProductListItem[]> {
    return request<VendorProductListItem[]>(`${VENDOR_BASE}/products`, {
      method: "GET",
    });
  },

  /** Get a single product for edit. */
  async getProduct(productId: string): Promise<VendorProductForEdit> {
    return request<VendorProductForEdit>(`${VENDOR_BASE}/products/${productId}`, {
      method: "GET",
    });
  },

  /** Create a new product. Returns created product (id, name, sku, status, createdAt). */
  async createProduct(
    payload: CreateVendorProductPayload
  ): Promise<CreateVendorProductResponse> {
    return request<CreateVendorProductResponse>(`${VENDOR_BASE}/products`, {
      method: "POST",
      body: payload,
    });
  },

  /** Update an existing product. */
  async updateProduct(
    productId: string,
    payload: UpdateVendorProductPayload
  ): Promise<VendorProductForEdit> {
    return request<VendorProductForEdit>(`${VENDOR_BASE}/products/${productId}`, {
      method: "PUT",
      body: payload,
    });
  },

  /** Upload a product image. Returns the public URL to use in imageUrls. */
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const base = getBaseUrl();
    const url = base ? `${base}${VENDOR_BASE}/upload` : `${VENDOR_BASE}/upload`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const json = (await res.json()) as { success?: boolean; data?: { url: string }; error?: { message: string } };
    if (!res.ok) {
      const msg = json?.error?.message ?? res.statusText ?? "Upload failed";
      throw new ServiceError(msg, "UPLOAD_ERROR", res.status);
    }
    if (!json.success || !json.data?.url) {
      throw new ServiceError("Invalid upload response", "UPLOAD_ERROR");
    }
    return json.data;
  },
};
