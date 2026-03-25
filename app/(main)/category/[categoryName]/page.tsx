import Link from "next/link";
import { CategoryPage } from "@/components/CategoryPage";
import { getCategoryBySlug, getSubCategoryBySlug } from "@/lib/data/categories";
import { MENU_TYPE_SLUGS, type MenuTypeSlug } from "@/lib/catalog-constants";
import {
  getProducts,
  getProductsByMenuType,
  getMenuTypeDisplayName,
} from "@/lib/data/products";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}) {
  const { categoryName: categorySlug } = await params;
  const normalizedSlug = categorySlug.trim().toLowerCase();

  if (MENU_TYPE_SLUGS.includes(normalizedSlug as MenuTypeSlug)) {
    const products = await getProductsByMenuType(normalizedSlug as MenuTypeSlug, { limit: 48 });
    const displayName = getMenuTypeDisplayName(normalizedSlug as MenuTypeSlug);
    return (
      <CategoryPage
        categoryName={displayName}
        categorySlug={normalizedSlug}
        products={products}
      />
    );
  }

  const category = await getCategoryBySlug(categorySlug);

  if (category) {
    const products = await getProducts({ categorySlug, limit: 48 });
    return (
      <CategoryPage
        categoryName={category.name}
        categorySlug={category.slug}
        products={products}
        apiCategorySlug={category.slug}
      />
    );
  }

  const subCategory = await getSubCategoryBySlug(categorySlug);
  if (subCategory) {
    const products = await getProducts({
      categorySlug: subCategory.categorySlug,
      subCategorySlug: subCategory.subCategorySlug,
      limit: 48,
    });
    return (
      <CategoryPage
        categoryName={subCategory.subCategoryName}
        categorySlug={categorySlug}
        products={products}
        apiCategorySlug={subCategory.categorySlug}
        apiSubCategorySlug={subCategory.subCategorySlug}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Category not found</h1>
        <p className="text-gray-600 mb-6">This category may have been removed.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
