import Link from "next/link";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { getProductById, getProductBySlug, getProductCategoryInfo, getRelatedProducts } from "@/lib/data/products";

/** UUID pattern — 8-4-4-4-12 hex groups */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Product not found</h1>
        <p className="text-gray-600 mb-6">This product may have been removed or is no longer available.</p>
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

function ProductError() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">We couldn't load this product. Please try again.</p>
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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  let slugOrId: string;
  try {
    const resolved = await params;
    slugOrId = resolved.slug;
  } catch {
    return <ProductError />;
  }

  let product: Awaited<ReturnType<typeof getProductById>> = null;
  let categoryInfo: Awaited<ReturnType<typeof getProductCategoryInfo>> = null;

  try {
    // Accept both UUID (legacy links) and SEO slug (new links).
    const productFetch = UUID_RE.test(slugOrId)
      ? getProductById(slugOrId)
      : getProductBySlug(slugOrId);

    const productId = UUID_RE.test(slugOrId) ? slugOrId : null;

    product = await productFetch;

    if (product) {
      categoryInfo = await getProductCategoryInfo(productId ?? product.id);
    }
  } catch {
    return <ProductError />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const specifications = product.specifications ?? [];
  const brand =
    specifications.find((s) => s.label?.toLowerCase() === "brand")?.value ?? "Brand";
  const categoryName = categoryInfo?.categoryName ?? "Category";
  const subCategoryName = categoryInfo?.subCategoryName ?? "Products";
  const categorySlug = categoryInfo?.categorySlug ?? "";
  const subCategorySlug = categoryInfo?.subCategorySlug ?? "mobile-phones";

  const [relatedFromStores, relatedToItem] = await Promise.all([
    getRelatedProducts(product.id, { categorySlug, limit: 12 }),
    getRelatedProducts(product.id, { subCategorySlug, limit: 12 }),
  ]);

  return (
    <ProductDetailPage
      product={product}
      categoryName={categoryName}
      subCategoryName={subCategoryName}
      subCategorySlug={subCategorySlug}
      brand={brand}
      relatedFromStores={relatedFromStores}
      relatedToItem={relatedToItem}
    />
  );
}
