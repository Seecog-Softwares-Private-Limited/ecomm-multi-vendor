import { prisma } from "@/lib/prisma";
import type { CategoryItem, CategoryTreeItem } from "@/types/catalog";

/** Default icon/color by slug for categories that don't have them in DB. */
const CATEGORY_DISPLAY: Record<string, { icon: string; color: string }> = {
  electronics: { icon: "📱", color: "from-blue-500 to-indigo-600" },
  fashion: { icon: "👗", color: "from-pink-500 to-rose-600" },
  footwear: { icon: "👟", color: "from-orange-500 to-amber-600" },
  home: { icon: "🏠", color: "from-green-500 to-emerald-600" },
  "home-living": { icon: "🏠", color: "from-green-500 to-emerald-600" },
  appliances: { icon: "🔌", color: "from-slate-500 to-zinc-600" },
  furniture: { icon: "🛋️", color: "from-amber-600 to-orange-700" },
  grocery: { icon: "🛒", color: "from-lime-500 to-green-600" },
  health: { icon: "💊", color: "from-teal-500 to-emerald-600" },
  beauty: { icon: "💄", color: "from-purple-500 to-violet-600" },
  sports: { icon: "⚽", color: "from-orange-500 to-amber-600" },
  toys: { icon: "🧸", color: "from-sky-500 to-blue-600" },
  books: { icon: "📚", color: "from-teal-500 to-cyan-600" },
  automotive: { icon: "🚗", color: "from-gray-600 to-slate-700" },
  watches: { icon: "⌚", color: "from-indigo-500 to-violet-600" },
  jewelry: { icon: "💍", color: "from-yellow-500 to-amber-600" },
  bags: { icon: "👜", color: "from-rose-500 to-pink-600" },
  office: { icon: "📝", color: "from-blue-400 to-indigo-500" },
  "pet-supplies": { icon: "🐾", color: "from-amber-500 to-yellow-600" },
  garden: { icon: "🌿", color: "from-green-600 to-lime-600" },
  industrial: { icon: "🔧", color: "from-zinc-500 to-stone-600" },
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

const SUBCATEGORY_ICONS: Record<string, string> = {
  mobiles: "📱",
  laptops: "💻",
  accessories: "🎧",
  mens: "👔",
  womens: "👗",
  kids: "🧒",
  kitchen: "🍳",
  furniture: "🛋️",
  decor: "🖼️",
  fiction: "📖",
  nonfiction: "📚",
  education: "🎓",
  fitness: "💪",
  outdoor: "🏕️",
  "team-sports": "⚽",
  footwear: "👟",
  skincare: "✨",
  makeup: "💄",
  haircare: "💇",
};

function subcategoryIcon(slug: string): string {
  return SUBCATEGORY_ICONS[slug] ?? "🛍️";
}

/**
 * All categories with nested subcategories for mobile department / browse UI.
 */
export async function getCategoryTree(): Promise<CategoryTreeItem[]> {
  const list = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      subCategories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true },
      },
    },
  });
  return list.map((c) => {
    const base = toCategoryItem(c);
    return {
      ...base,
      subcategories: c.subCategories.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        icon: subcategoryIcon(s.slug),
      })),
    };
  });
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
 * URL slug aliases for subcategories (e.g. /category/mobile-phones -> electronics/mobiles).
 */
const SUBCATEGORY_SLUG_ALIASES: Record<string, string> = {
  "mobile-phones": "mobiles",
  /** Common storefront path: /category/shoes → footwear subcategory (e.g. Sports Footwear). */
  shoes: "footwear",
};

/**
 * Resolve a single slug to a subcategory (for /category/[slug] when slug is a subcategory).
 * Returns parent category + subcategory display name and slug for product fetch.
 */
export async function getSubCategoryBySlug(
  slug: string
): Promise<{ categorySlug: string; categoryName: string; subCategorySlug: string; subCategoryName: string } | null> {
  const normalized = slug.trim().toLowerCase();
  const subSlug = SUBCATEGORY_SLUG_ALIASES[normalized] ?? normalized;
  const sub = await prisma.subCategory.findFirst({
    where: { slug: subSlug, deletedAt: null },
    select: { id: true, slug: true, name: true, categoryId: true },
  });
  if (!sub) return null;
  const cat = await prisma.category.findFirst({
    where: { id: sub.categoryId, deletedAt: null },
    select: { slug: true, name: true },
  });
  if (!cat) return null;
  return {
    categorySlug: cat.slug,
    categoryName: cat.name,
    subCategorySlug: sub.slug,
    subCategoryName: sub.name,
  };
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
