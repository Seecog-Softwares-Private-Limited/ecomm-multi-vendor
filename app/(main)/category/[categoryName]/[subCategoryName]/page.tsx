import Link from "next/link";
import { CategoryPage } from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { prisma } from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryName: string; subCategoryName: string }>;
}) {
  const { categoryName, subCategoryName } = await params;
  const cat = await getCategoryBySlug(categoryName);
  if (!cat) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="max-w-md rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Category not found</h1>
          <Link
            href="/browse-categories"
            className="mt-4 inline-block rounded-xl bg-[#FF6A00] px-6 py-3 font-semibold text-white hover:bg-[#E55F00]"
          >
            Browse categories
          </Link>
        </div>
      </div>
    );
  }

  const categoryRecord = await prisma.category.findFirst({
    where: { slug: cat.slug, deletedAt: null },
    select: { id: true },
  });
  if (!categoryRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="max-w-md rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Category not found</h1>
          <Link
            href="/browse-categories"
            className="mt-4 inline-block rounded-xl bg-[#FF6A00] px-6 py-3 font-semibold text-white hover:bg-[#E55F00]"
          >
            Browse categories
          </Link>
        </div>
      </div>
    );
  }

  const sub = await prisma.subCategory.findFirst({
    where: {
      categoryId: categoryRecord.id,
      slug: subCategoryName.trim().toLowerCase(),
      deletedAt: null,
    },
    select: { slug: true, name: true },
  });

  if (!sub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="max-w-md rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Subcategory not found</h1>
          <Link
            href="/browse-categories"
            className="mt-4 inline-block rounded-xl bg-[#FF6A00] px-6 py-3 font-semibold text-white hover:bg-[#E55F00]"
          >
            Browse categories
          </Link>
        </div>
      </div>
    );
  }

  const products = await getProducts({
    categorySlug: cat.slug,
    subCategorySlug: sub.slug,
    limit: 48,
  });

  return (
    <CategoryPage
      categoryName={sub.name}
      categorySlug={sub.slug}
      products={products}
      apiCategorySlug={cat.slug}
      apiSubCategorySlug={sub.slug}
    />
  );
}
