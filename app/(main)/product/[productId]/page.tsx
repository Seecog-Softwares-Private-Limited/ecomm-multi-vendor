import Link from "next/link";
import { ProductDetailPageEnhanced } from "@/app/pages/ProductDetailPageEnhanced";
import { getProductById, getProductReviews, getProductQuestions } from "@/lib/data/products";

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const [product, reviews, questions] = await Promise.all([
    getProductById(productId),
    getProductReviews(productId),
    getProductQuestions(productId),
  ]);

  if (!product) {
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

  const ratingBreakdown =
    reviews.length > 0
      ? [5, 4, 3, 2, 1].map((stars) => {
          const count = reviews.filter((r) => r.rating === stars).length;
          const percentage = Math.round((count / reviews.length) * 100);
          return { stars, count, percentage };
        })
      : [
          { stars: 5, count: 0, percentage: 0 },
          { stars: 4, count: 0, percentage: 0 },
          { stars: 3, count: 0, percentage: 0 },
          { stars: 2, count: 0, percentage: 0 },
          { stars: 1, count: 0, percentage: 0 },
        ];

  return (
    <ProductDetailPageEnhanced
      productId={product.id}
      productImages={product.images.length > 0 ? product.images : ["IMAGE 1"]}
      reviews={reviews.map((r) => ({
        id: r.id,
        user: r.user,
        rating: r.rating,
        date: r.date,
        comment: r.comment ?? "",
        verified: r.verified,
        helpful: r.helpful,
        images: 0,
      }))}
      questions={questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer ?? "",
        askedBy: q.askedBy,
        answeredBy: q.answeredBy,
        helpful: q.helpful,
        date: q.date,
      }))}
      specifications={product.specifications}
      ratingBreakdown={ratingBreakdown}
      avgRating={product.avgRating ?? 0}
      totalReviews={product.reviewCount}
      productStock={product.stock}
    />
  );
}
