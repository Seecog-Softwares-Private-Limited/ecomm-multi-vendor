import { HomePage } from "@/app/pages/HomePage";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

/** DB-backed; skip build-time prerender (no MySQL required during `next build`). */
export const dynamic = "force-dynamic";

export default async function Page() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ limit: 8 }),
  ]);
  return <HomePage categories={categories} products={products} />;
}
