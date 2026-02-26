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

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  slug?: string;
  imageUrl?: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number;
  stock: number;
  avgRating: number | null;
  reviewCount: number;
  images: string[];
  specifications: { label: string; value: string }[];
  variations: { name: string; values: string[] }[];
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
