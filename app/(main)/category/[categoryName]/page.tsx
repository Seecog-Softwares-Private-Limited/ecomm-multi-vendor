import Link from "next/link";
import { CategoryListingPage } from "@/app/pages/CategoryListingPage";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}) {
  const { categoryName: categorySlug } = await params;

  const [category, products] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProducts({ categorySlug, limit: 48 }),
  ]);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Category not found</h1>
          <p className="text-gray-600 mb-6">This category may have been removed.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CategoryListingPage
      categoryName={category.name}
      categorySlug={category.slug}
      products={products}
    />
  );
}
