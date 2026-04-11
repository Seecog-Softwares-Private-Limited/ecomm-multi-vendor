import type { Prisma } from "@prisma/client";
import type { MenuTypeSlug } from "@/lib/catalog-constants";
import { prisma } from "@/lib/prisma";
import { productPinServiceableWhereAsync } from "@/lib/data/product-pin-filter";
import { coalesceVariantImagesFromDb } from "@/lib/product-sku-variant";
import { memCacheGetOrSet } from "@/lib/utils/mem-cache";
import type { ProductDetail, ProductListItem, ReviewItem, ProductQuestionItem } from "@/types/catalog";

const CAT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCategoryId(slug: string): Promise<string | null> {
  return memCacheGetOrSet(`cat:slug:${slug}`, CAT_CACHE_TTL, async () => {
    const cat = await prisma.category.findFirst({
      where: { slug: slug.trim().toLowerCase(), deletedAt: null },
      select: { id: true },
    });
    return cat?.id ?? null;
  });
}

async function getSubCategoryId(slug: string): Promise<string | null> {
  return memCacheGetOrSet(`subcat:slug:${slug}`, CAT_CACHE_TTL, async () => {
    const sub = await prisma.subCategory.findFirst({
      where: { slug: slug.trim().toLowerCase(), deletedAt: null },
      select: { id: true },
    });
    return sub?.id ?? null;
  });
}

export type { MenuTypeSlug } from "@/lib/catalog-constants";
export { MENU_TYPE_SLUGS, isMenuTypeSlug } from "@/lib/catalog-constants";

const toNumber = (v: unknown): number => (typeof v === "number" ? v : Number(v) ?? 0);

/**
 * List products (active, not deleted). Optional category, subcategory, or text search (q).
 */
export async function getProducts(options: {
  categorySlug?: string;
  subCategorySlug?: string;
  q?: string;
  limit?: number;
  offset?: number;
  /** If set (6 digits), only sellers with no PIN list or matching PIN. */
  pincode?: string;
}): Promise<ProductListItem[]> {
  const { categorySlug, subCategorySlug, q: searchQuery, limit = 24, offset = 0, pincode } = options;

  let categoryId: string | undefined;
  let subCategoryId: string | undefined;

  if (categorySlug) {
    const id = await getCategoryId(categorySlug);
    if (!id) return [];
    categoryId = id;
  }
  if (subCategorySlug) {
    const id = await getSubCategoryId(subCategorySlug);
    if (!id) return [];
    subCategoryId = id;
  }

  const searchTerm = searchQuery?.trim();
  const pinWhere = await productPinServiceableWhereAsync(pincode);
  const list = await prisma.product.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      ...pinWhere,
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      ...(searchTerm && searchTerm.length > 0 ? { name: { contains: searchTerm } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      name: true,
      slug: true,
      sellingPrice: true,
      mrp: true,
      avgRating: true,
      reviewCount: true,
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });

  return list.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.id,
    price: toNumber(p.sellingPrice),
    oldPrice: toNumber(p.mrp) > toNumber(p.sellingPrice) ? toNumber(p.mrp) : undefined,
    rating: toNumber(p.avgRating) || 0,
    reviews: p.reviewCount ?? 0,
    imageUrl: p.images[0]?.url,
  }));
}

/**
 * Get related products for a product detail page (same category or subcategory, excluding current).
 */
export async function getRelatedProducts(
  excludeProductId: string,
  options: {
    categorySlug?: string;
    subCategorySlug?: string;
    limit?: number;
    pincode?: string;
  }
): Promise<ProductListItem[]> {
  const { categorySlug, subCategorySlug, limit = 12, pincode } = options;
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;

  if (subCategorySlug) {
    const normalized = subCategorySlug.trim().toLowerCase();
    const sub = await prisma.subCategory.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    subCategoryId = sub?.id;
    if (!subCategoryId) return [];
  } else if (categorySlug) {
    const normalized = categorySlug.trim().toLowerCase();
    const cat = await prisma.category.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    categoryId = cat?.id;
    if (!categoryId) return [];
  } else {
    return [];
  }

  const pinWhere = await productPinServiceableWhereAsync(pincode);
  const list = await prisma.product.findMany({
    where: {
      id: { not: excludeProductId },
      deletedAt: null,
      status: "ACTIVE",
      ...pinWhere,
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
    },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      sellingPrice: true,
      mrp: true,
      avgRating: true,
      reviewCount: true,
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });

  return list.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.id,
    price: toNumber(p.sellingPrice),
    oldPrice: toNumber(p.mrp) > toNumber(p.sellingPrice) ? toNumber(p.mrp) : undefined,
    rating: toNumber(p.avgRating) || 0,
    reviews: p.reviewCount ?? 0,
    imageUrl: p.images[0]?.url,
  }));
}

const MENU_TYPE_NAMES: Record<MenuTypeSlug, string> = {
  "deals": "Deals",
  "new-arrivals": "New Arrivals",
  "best-sellers": "Best Sellers",
};

export function getMenuTypeDisplayName(slug: MenuTypeSlug): string {
  return MENU_TYPE_NAMES[slug] ?? slug;
}

/**
 * List products for menu types: Deals (discounted), New Arrivals (newest), Best Sellers (by popularity/reviews).
 */
export async function getProductsByMenuType(
  type: MenuTypeSlug,
  options: { limit?: number; offset?: number; pincode?: string; q?: string } = {}
): Promise<ProductListItem[]> {
  const { limit = 48, offset = 0, pincode, q } = options;
  const svc = await productPinServiceableWhereAsync(pincode);
  const searchTerm = q?.trim();
  const nameWhere =
    searchTerm && searchTerm.length > 0 ? { name: { contains: searchTerm } } : {};

  const select = {
    id: true,
    name: true,
    slug: true,
    sellingPrice: true,
    mrp: true,
    avgRating: true,
    reviewCount: true,
    images: { take: 1, orderBy: { sortOrder: "asc" as const }, select: { url: true } },
  };

  if (type === "deals") {
    const list = await prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE", ...svc, ...nameWhere },
      orderBy: { createdAt: "desc" },
      take: 500,
      select,
    });
    const withDiscount = list
      .filter((p) => toNumber(p.mrp) > toNumber(p.sellingPrice))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug ?? p.id,
        price: toNumber(p.sellingPrice),
        oldPrice: toNumber(p.mrp),
        rating: toNumber(p.avgRating) || 0,
        reviews: p.reviewCount ?? 0,
        imageUrl: p.images[0]?.url,
        _discountPct: toNumber(p.mrp) > 0
          ? ((toNumber(p.mrp) - toNumber(p.sellingPrice)) / toNumber(p.mrp)) * 100
          : 0,
      }))
      .sort((a, b) => b._discountPct - a._discountPct)
      .slice(offset, offset + limit);
    return withDiscount.map(({ _discountPct: _, ...rest }) => rest);
  }

  if (type === "new-arrivals") {
    const list = await prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE", ...svc },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select,
    });
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug ?? p.id,
      price: toNumber(p.sellingPrice),
      oldPrice: toNumber(p.mrp) > toNumber(p.sellingPrice) ? toNumber(p.mrp) : undefined,
      rating: toNumber(p.avgRating) || 0,
      reviews: p.reviewCount ?? 0,
      imageUrl: p.images[0]?.url,
    }));
  }

  if (type === "best-sellers") {
    const list = await prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE", ...svc, ...nameWhere },
      orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
      select,
    });
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug ?? p.id,
      price: toNumber(p.sellingPrice),
      oldPrice: toNumber(p.mrp) > toNumber(p.sellingPrice) ? toNumber(p.mrp) : undefined,
      rating: toNumber(p.avgRating) || 0,
      reviews: p.reviewCount ?? 0,
      imageUrl: p.images[0]?.url,
    }));
  }

  return [];
}

/**
 * Get distinct brands for a category (or subcategory) for filter sidebar.
 * Uses ProductSpecification where key = 'Brand'/'brand'; if none, derives from product name first word.
 */
export async function getBrandsForCategory(options: {
  categorySlug?: string;
  subCategorySlug?: string;
  pincode?: string;
}): Promise<string[]> {
  const { categorySlug, subCategorySlug, pincode } = options;
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;

  if (categorySlug) {
    const normalized = categorySlug.trim().toLowerCase();
    const cat = await prisma.category.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    categoryId = cat?.id;
  }
  if (subCategorySlug) {
    const normalized = subCategorySlug.trim().toLowerCase();
    const sub = await prisma.subCategory.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    subCategoryId = sub?.id;
  }

  const pinWhere = await productPinServiceableWhereAsync(pincode);
  const productWhere: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: "ACTIVE",
    ...pinWhere,
    ...(categoryId && { categoryId }),
    ...(subCategoryId && { subCategoryId }),
  };

  const productIds = await prisma.product.findMany({
    where: productWhere,
    select: { id: true, name: true },
  });
  const ids = productIds.map((p) => p.id);
  if (ids.length === 0) return [];

  const fromSpecs = await prisma.productSpecification.findMany({
    where: {
      productId: { in: ids },
      key: { in: ["Brand", "brand"] },
      value: { not: "" },
    },
    select: { value: true },
    distinct: ["value"],
  });
  const specBrands = fromSpecs.map((s) => s.value.trim()).filter(Boolean);
  if (specBrands.length > 0) return [...new Set(specBrands)].sort();

  const firstWords = productIds
    .map((p) => p.name.trim().split(/\s+/)[0])
    .filter((w) => w && w.length >= 2);
  return [...new Set(firstWords)].sort();
}

export type RatingFacet = { minRating: number; label: string; count: number };

/**
 * Get rating facets for a category (for filter sidebar). Returns counts of products
 * with avgRating >= 5, >= 4, >= 3, >= 2 so the UI can show dynamic "Customer Ratings" options.
 */
export async function getRatingFacetsForCategory(options: {
  categorySlug?: string;
  subCategorySlug?: string;
  pincode?: string;
}): Promise<RatingFacet[]> {
  const { categorySlug, subCategorySlug, pincode } = options;
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;

  if (categorySlug) {
    const normalized = categorySlug.trim().toLowerCase();
    const cat = await prisma.category.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    categoryId = cat?.id;
  }
  if (subCategorySlug) {
    const normalized = subCategorySlug.trim().toLowerCase();
    const sub = await prisma.subCategory.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    subCategoryId = sub?.id;
  }

  const pinWhereFacets = await productPinServiceableWhereAsync(pincode);
  const productWhere: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: "ACTIVE",
    ...pinWhereFacets,
    ...(categoryId && { categoryId }),
    ...(subCategoryId && { subCategoryId }),
  };

  const thresholds = [5, 4, 3, 2] as const;
  const facets: RatingFacet[] = [];
  const labels: Record<number, string> = { 5: "5★", 4: "4★+", 3: "3★+", 2: "2★+" };

  for (const minRating of thresholds) {
    const count = await prisma.product.count({
      where: {
        ...productWhere,
        avgRating: { gte: minRating },
      },
    });
    facets.push({ minRating, label: labels[minRating], count });
  }

  return facets;
}

/**
 * Get category and subcategory names for a product (for breadcrumb on detail page).
 */
export async function getProductCategoryInfo(productId: string): Promise<{
  categoryName: string;
  categorySlug: string;
  subCategoryName: string;
  subCategorySlug: string;
} | null> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: {
      categoryId: true,
      subCategoryId: true,
      category: { select: { name: true, slug: true } },
      subCategory: { select: { name: true, slug: true } },
    },
  });
  if (!product?.category) return null;
  return {
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    subCategoryName: product.subCategory?.name ?? product.category.name,
    subCategorySlug: product.subCategory?.slug ?? product.category.slug,
  };
}

/**
 * Get a single product by its URL slug with full detail.
 * Falls back to null if slug is not found or product is inactive.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { url: true } },
      specifications: { where: { deletedAt: null }, select: { key: true, value: true } },
      variations: { where: { deletedAt: null }, select: { name: true, values: true } },
      productVariants: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: { id: true, color: true, size: true, price: true, stock: true, sku: true, image: true, images: true },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") return null;

  const valuesFromJson = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : [];

  return {
    id: product.id,
    sellerId: product.sellerId,
    name: product.name,
    slug: product.slug ?? product.id,
    description: product.description,
    price: toNumber(product.sellingPrice),
    mrp: toNumber(product.mrp),
    stock: product.stock,
    avgRating: product.avgRating != null ? toNumber(product.avgRating) : null,
    reviewCount: product.reviewCount ?? 0,
    images: product.images.map((i) => i.url),
    specifications: product.specifications.map((s) => ({ label: s.key, value: s.value })),
    variations: product.variations.map((v) => ({
      name: v.name,
      values: valuesFromJson(v.values),
    })),
    skuVariants: (product.productVariants ?? []).map((v) => {
      const imgs = coalesceVariantImagesFromDb(v.images, v.image);
      return {
        id: v.id,
        color: v.color ?? null,
        size: v.size ?? null,
        price: toNumber(v.price),
        stock: v.stock,
        sku: v.sku ?? null,
        image: imgs[0] ?? null,
        images: imgs,
      };
    }),
  };
}

/**
 * Get a single product by id with full detail (images, specs, variations, reviews, questions).
 */
export async function getProductById(id: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { url: true } },
      specifications: { where: { deletedAt: null }, select: { key: true, value: true } },
      variations: { where: { deletedAt: null }, select: { name: true, values: true } },
      productVariants: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: { id: true, color: true, size: true, price: true, stock: true, sku: true, image: true, images: true },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") return null;

  const valuesFromJson = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : [];

  return {
    id: product.id,
    sellerId: product.sellerId,
    name: product.name,
    slug: product.slug ?? product.id,
    description: product.description,
    price: toNumber(product.sellingPrice),
    mrp: toNumber(product.mrp),
    stock: product.stock,
    avgRating: product.avgRating != null ? toNumber(product.avgRating) : null,
    reviewCount: product.reviewCount ?? 0,
    images: product.images.map((i) => i.url),
    specifications: product.specifications.map((s) => ({ label: s.key, value: s.value })),
    variations: product.variations.map((v) => ({
      name: v.name,
      values: valuesFromJson(v.values),
    })),
    skuVariants: (product.productVariants ?? []).map((v) => {
      const imgs = coalesceVariantImagesFromDb(v.images, v.image);
      return {
        id: v.id,
        color: v.color ?? null,
        size: v.size ?? null,
        price: toNumber(v.price),
        stock: v.stock,
        sku: v.sku ?? null,
        image: imgs[0] ?? null,
        images: imgs,
      };
    }),
  };
}

/**
 * Get reviews for a product (for detail page).
 */
export async function getProductReviews(productId: string, limit = 20): Promise<ReviewItem[]> {
  const reviews = await prisma.review.findMany({
    where: { productId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  return reviews.map((r) => ({
    id: r.id,
    user: [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || "User",
    rating: r.rating,
    date: r.createdAt.toISOString().slice(0, 10),
    comment: r.comment,
    verified: r.verified,
    helpful: r.helpfulCount ?? 0,
  }));
}

/**
 * Get Q&A for a product.
 */
export async function getProductQuestions(
  productId: string,
  limit = 20
): Promise<ProductQuestionItem[]> {
  const questions = await prisma.productQuestion.findMany({
    where: { productId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    answer: q.answer,
    askedBy: "User",
    answeredBy: "Seller",
    helpful: q.helpfulCount ?? 0,
    date: q.createdAt.toISOString().slice(0, 10),
  }));
}
