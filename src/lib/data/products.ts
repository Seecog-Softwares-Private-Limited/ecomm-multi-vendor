import { prisma } from "@/lib/prisma";
import type { ProductDetail, ProductListItem, ReviewItem, ProductQuestionItem } from "@/types/catalog";

const toNumber = (v: unknown): number => (typeof v === "number" ? v : Number(v) ?? 0);

/**
 * List products (active, not deleted). Optional category or subcategory slug filter.
 */
export async function getProducts(options: {
  categorySlug?: string;
  subCategorySlug?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductListItem[]> {
  const { categorySlug, subCategorySlug, limit = 24, offset = 0 } = options;

  let categoryId: string | undefined;
  let subCategoryId: string | undefined;

  if (categorySlug) {
    const normalized = categorySlug.trim().toLowerCase();
    const cat = await prisma.category.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    categoryId = cat?.id;
    if (!categoryId) return [];
  }
  if (subCategorySlug) {
    const normalized = subCategorySlug.trim().toLowerCase();
    const sub = await prisma.subCategory.findFirst({
      where: { slug: normalized, deletedAt: null },
      select: { id: true },
    });
    subCategoryId = sub?.id;
    if (!subCategoryId) return [];
  }

  const list = await prisma.product.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      name: true,
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
    price: toNumber(p.sellingPrice),
    oldPrice: toNumber(p.mrp) > toNumber(p.sellingPrice) ? toNumber(p.mrp) : undefined,
    rating: toNumber(p.avgRating) || 0,
    reviews: p.reviewCount ?? 0,
    imageUrl: p.images[0]?.url,
  }));
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
    },
  });

  if (!product || product.status !== "ACTIVE") return null;

  const valuesFromJson = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : [];

  return {
    id: product.id,
    name: product.name,
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
