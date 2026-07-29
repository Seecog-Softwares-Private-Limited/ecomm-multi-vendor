export type WishlistProduct = {
  id: string;
  name: string;
  slug?: string | null;
  sellingPrice: number;
  mrp: number;
  stock: number;
  status: string;
  avgRating: number | null;
  imageUrl: string | null;
  listingPaused?: boolean;
};

export type WishlistItem = {
  id: string;
  productId: string;
  variantKey: string | null;
  product: WishlistProduct;
  /** Preserved fetch order for "Recently Added" sort. */
  addedOrder: number;
};

export type WishlistSort = "recent" | "price-asc" | "price-desc" | "name-asc";

export const WISHLIST_SORT_OPTIONS: Array<{ id: WishlistSort; label: string }> = [
  { id: "recent", label: "Recently Added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name-asc", label: "Name A-Z" },
];

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function productHref(item: WishlistItem) {
  return `/product/${item.product.slug ?? item.productId}`;
}

export function cartItemKey(productId: string, variantKey: string | null) {
  return `${productId}:${variantKey ?? ""}`;
}

export function isWishlistItemInStock(item: WishlistItem): boolean {
  return (
    item.product.stock > 0 &&
    item.product.status === "ACTIVE" &&
    !item.product.listingPaused
  );
}

export function getStockStatus(item: WishlistItem): StockStatus {
  if (!isWishlistItemInStock(item)) return "out_of_stock";
  if (item.product.stock <= 5) return "low_stock";
  return "in_stock";
}

export function getDiscountPercent(sellingPrice: number, mrp: number): number | null {
  if (mrp <= sellingPrice || mrp <= 0) return null;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

export function formatVariantLabel(variantKey: string | null): string | null {
  if (!variantKey) return null;
  const parts = variantKey.split("|").map((part) => {
    const [label, value] = part.split(":");
    if (!value) return null;
    return `${label ?? "Option"}: ${value}`;
  });
  const filtered = parts.filter(Boolean);
  return filtered.length > 0 ? filtered.join(" · ") : null;
}

export function sortWishlistItems(
  items: WishlistItem[],
  sort: WishlistSort
): WishlistItem[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.product.sellingPrice - b.product.sellingPrice);
    case "price-desc":
      return copy.sort((a, b) => b.product.sellingPrice - a.product.sellingPrice);
    case "name-asc":
      return copy.sort((a, b) => a.product.name.localeCompare(b.product.name));
    case "recent":
    default:
      return copy.sort((a, b) => a.addedOrder - b.addedOrder);
  }
}

export function normalizeWishlistItems(
  raw: Array<{
    id: string;
    productId: string;
    variantKey: string | null;
    product: WishlistProduct;
  }>
): WishlistItem[] {
  return raw.map((item, index) => ({
    ...item,
    addedOrder: index,
    product: {
      ...item.product,
      slug: item.product.slug ?? null,
    },
  }));
}
