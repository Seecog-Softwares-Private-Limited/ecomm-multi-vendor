/**
 * Vendor dashboard API types.
 */

export type VendorProductStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "inactive";

export interface VendorProductListItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  status: VendorProductStatus;
  lastUpdated: string;
  imageUrl?: string | null;
}

/** Payload for creating a product (POST /api/vendor/products). */
export interface CreateVendorProductPayload {
  name: string;
  description?: string;
  categorySlug: string;
  subCategorySlug: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  gstPercent?: number;
  stock: number;
  returnPolicy?: "no-return" | "7days" | "10days" | "15days";
  status?: "DRAFT" | "PENDING_APPROVAL";
  imageUrls?: string[];
  specifications?: { key: string; value: string }[];
  variations?: { name: string; values: string[] }[];
}

export interface CreateVendorProductResponse {
  id: string;
  name: string;
  sku: string;
  status: string;
  createdAt: string;
}

/** Single product for edit (GET /api/vendor/products/:productId). */
export interface VendorProductForEdit {
  id: string;
  name: string;
  description: string | null;
  categorySlug: string;
  subCategorySlug: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  gstPercent: number | null;
  stock: number;
  returnPolicy: "no-return" | "7days" | "10days" | "15days";
  status: string;
  imageUrls: string[];
  specifications: { key: string; value: string }[];
  variations: { name: string; values: string[] }[];
}

/** Payload for update (PUT) — same shape as create. */
export type UpdateVendorProductPayload = CreateVendorProductPayload;
