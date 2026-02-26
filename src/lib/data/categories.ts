import { prisma } from "@/lib/prisma";
import type { CategoryItem } from "@/types/catalog";

/** Default icon/color by slug for categories that don't have them in DB. */
const CATEGORY_DISPLAY: Record<string, { icon: string; color: string }> = {
  electronics: { icon: "📱", color: "from-blue-500 to-indigo-600" },
  fashion: { icon: "👗", color: "from-pink-500 to-rose-600" },
  "home-living": { icon: "🏠", color: "from-green-500 to-emerald-600" },
  beauty: { icon: "💄", color: "from-purple-500 to-violet-600" },
  sports: { icon: "⚽", color: "from-orange-500 to-amber-600" },
  books: { icon: "📚", color: "from-teal-500 to-cyan-600" },
};

function toCategoryItem(c: { id: string; slug: string; name: string }): CategoryItem {
  const display = CATEGORY_DISPLAY[c.slug] ?? { icon: "📦", color: "from-gray-500 to-gray-600" };
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: display.icon,
    color: display.color,
  };
}

/**
 * Fetch all non-deleted categories for display (e.g. homepage).
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const list = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true },
  });
  return list.map(toCategoryItem);
}

/**
 * Fetch a single category by slug (for category pages).
 * Slug is normalized to lowercase for lookup so URL casing does not matter.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  const normalized = slug.trim().toLowerCase();
  const c = await prisma.category.findFirst({
    where: { slug: normalized, deletedAt: null },
    select: { id: true, slug: true, name: true },
  });
  return c ? toCategoryItem(c) : null;
}

/**
 * Resolve category and subcategory slugs to IDs for product create.
 * Returns null if either category or subcategory not found.
 */
export async function resolveCategoryAndSubCategoryIds(
  categorySlug: string,
  subCategorySlug: string
): Promise<{ categoryId: string; subCategoryId: string } | null> {
  const catSlug = categorySlug.trim().toLowerCase();
  const subSlug = subCategorySlug.trim().toLowerCase();
  const category = await prisma.category.findFirst({
    where: { slug: catSlug, deletedAt: null },
    select: { id: true },
  });
  if (!category) return null;
  const subCategory = await prisma.subCategory.findFirst({
    where: { categoryId: category.id, slug: subSlug, deletedAt: null },
    select: { id: true },
  });
  if (!subCategory) return null;
  return { categoryId: category.id, subCategoryId: subCategory.id };
}
