import type { ProductListItem } from "@/types/catalog";
import type { MenuTypeSlug } from "@/lib/catalog-constants";

const HOME_SECTION_LIMIT = 10;

async function fetchProducts(
  params: Record<string, string>,
  pincode: string
): Promise<ProductListItem[]> {
  const search = new URLSearchParams(params);
  const pin = pincode.replace(/\D/g, "").slice(0, 6);
  if (/^\d{6}$/.test(pin)) search.set("pincode", pin);
  const res = await fetch(`/api/products?${search.toString()}`, { credentials: "include" });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? (json.data as ProductListItem[]) : [];
}

async function fetchByMenu(menuType: MenuTypeSlug, pincode: string, limit = HOME_SECTION_LIMIT) {
  return fetchProducts({ menuType, limit: String(limit) }, pincode);
}

async function fetchByCategory(categorySlug: string, pincode: string, limit = HOME_SECTION_LIMIT) {
  return fetchProducts({ categorySlug, limit: String(limit) }, pincode);
}

export type HomePageProducts = {
  bestSellers: ProductListItem[];
  newArrivals: ProductListItem[];
  deals: ProductListItem[];
  recommended: ProductListItem[];
  topRated: ProductListItem[];
  electronics: ProductListItem[];
  home: ProductListItem[];
  beauty: ProductListItem[];
  fashion: ProductListItem[];
  sports: ProductListItem[];
};

export async function fetchHomePageProducts(pincode: string): Promise<HomePageProducts> {
  const [
    bestSellers,
    newArrivals,
    deals,
    recommended,
    electronics,
    home,
    beauty,
    fashion,
    sports,
  ] = await Promise.all([
    fetchByMenu("best-sellers", pincode),
    fetchByMenu("new-arrivals", pincode),
    fetchByMenu("deals", pincode),
    fetchProducts({ limit: String(HOME_SECTION_LIMIT) }, pincode),
    fetchByCategory("electronics", pincode),
    fetchByCategory("home", pincode),
    fetchByCategory("beauty", pincode),
    fetchByCategory("fashion", pincode),
    fetchByCategory("sports", pincode),
  ]);

  const topRated = [...recommended]
    .filter((p) => p.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, HOME_SECTION_LIMIT);

  return {
    bestSellers,
    newArrivals,
    deals,
    recommended,
    topRated,
    electronics,
    home,
    beauty,
    fashion,
    sports,
  };
}

export type ContinueShoppingItem = ProductListItem;

export async function fetchContinueShoppingProducts(): Promise<ContinueShoppingItem[]> {
  try {
    const res = await fetch("/api/cart/items", { credentials: "include" });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      const items = json?.data?.items ?? [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map(
          (item: {
            productId: string;
            name: string;
            price: number;
            mrp?: number;
            imageUrl?: string | null;
            slug?: string;
            rating?: number;
            reviews?: number;
          }) => ({
            id: item.productId,
            name: item.name,
            slug: item.slug ?? item.productId,
            price: item.price,
            oldPrice: item.mrp != null && item.mrp > item.price ? item.mrp : undefined,
            rating: item.rating ?? 0,
            reviews: item.reviews ?? 0,
            imageUrl: item.imageUrl ?? undefined,
          })
        );
      }
    }
  } catch {
    // fall through to guest cart
  }

  if (typeof window === "undefined") return [];
  const { getGuestCart } = await import("@/lib/guest-cart");
  return getGuestCart().map((item) => ({
    id: item.productId,
    name: item.name,
    slug: item.productId,
    price: item.price,
    oldPrice: item.mrp != null && item.mrp > item.price ? item.mrp : undefined,
    rating: 0,
    reviews: 0,
    imageUrl: item.imageUrl ?? undefined,
  }));
}
