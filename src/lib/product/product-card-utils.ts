import type { ProductListItem } from "@/types/catalog";

export type ProductCardProduct = ProductListItem & {
  stock?: number;
  sellerName?: string;
  status?: string;
};

export function formatProductRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function getProductDiscountPercent(price: number, oldPrice?: number | null): number | null {
  if (oldPrice == null || oldPrice <= price || oldPrice <= 0) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function productDetailHref(product: ProductListItem) {
  return `/product/${product.slug ?? product.id}`;
}

export type ProductStockBadge = "in_stock" | "low_stock" | "out_of_stock";

export function getProductStockBadge(product: ProductCardProduct): ProductStockBadge | null {
  if (product.stock == null) return null;
  const active = product.status == null || product.status === "ACTIVE";
  if (!active || product.stock <= 0) return "out_of_stock";
  if (product.stock <= 5) return "low_stock";
  return "in_stock";
}

export function hasProductRating(product: ProductListItem): boolean {
  return Number.isFinite(product.rating) && product.rating > 0;
}
