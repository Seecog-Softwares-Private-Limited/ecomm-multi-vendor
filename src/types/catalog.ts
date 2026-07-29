/**
 * Shared catalog types for UI and API. Used by server data layer and components.
 */

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  color?: string;
}

/** Category with subcategories for browse / department UI. */
export interface CategorySubItem {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface CategoryTreeItem extends CategoryItem {
  subcategories: CategorySubItem[];
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  /** SEO-friendly URL slug. Falls back to id for backward compatibility. */
  slug: string;
  imageUrl?: string;
}

/** Sellable SKU row (vendor-defined); when non-empty, PDP uses these for price/stock/options. */
export interface ProductSkuVariant {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  stock: number;
  sku: string | null;
  /** First gallery URL; use `images` for the full set. */
  image: string | null;
  /** Ordered URLs for this variant (PDP gallery). */
  images: string[];
}

export interface ProductDetail {
  id: string;
  /** Seller owning the product; used for PIN / service-area checks on PDP. */
  sellerId: string;
  name: string;
  /** SEO-friendly URL slug. Falls back to id for backward compatibility. */
  slug: string;
  description: string | null;
  price: number;
  mrp: number;
  stock: number;
  avgRating: number | null;
  reviewCount: number;
  images: string[];
  specifications: { label: string; value: string }[];
  variations: { name: string; values: string[] }[];
  /** SKU combinations with own price/stock (optional). */
  skuVariants: ProductSkuVariant[];
}

export interface ReviewItem {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string | null;
  verified: boolean;
  helpful: number;
  images?: number;
}

export interface ProductQuestionItem {
  id: string;
  question: string;
  answer: string | null;
  askedBy: string;
  answeredBy: string;
  helpful: number;
  date: string;
}
