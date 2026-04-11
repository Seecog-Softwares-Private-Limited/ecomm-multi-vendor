"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Star, ShoppingCart, Search, SlidersHorizontal, SearchX } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { addToGuestCart } from "@/lib/guest-cart";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";
import { MENU_TYPE_SLUGS, type MenuTypeSlug } from "@/lib/catalog-constants";

type ProductItem = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  imageUrl?: string | null;
};

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function parseMenuType(raw: string | null): MenuTypeSlug | null {
  if (!raw) return null;
  return (MENU_TYPE_SLUGS as readonly string[]).includes(raw) ? (raw as MenuTypeSlug) : null;
}

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const categorySlugFromUrl = searchParams.get("categorySlug")?.trim() || null;
  const menuTypeFromUrl = parseMenuType(searchParams.get("menuType"));
  const [query, setQuery] = useState(qFromUrl);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const { openCartDrawer } = useCartDrawer();
  const { location } = useDeliveryLocation();

  const searchTerm = qFromUrl.trim();

  const fetchProducts = useCallback(() => {
    if (!searchTerm) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ q: searchTerm, limit: "48" });
    if (categorySlugFromUrl) params.set("categorySlug", categorySlugFromUrl);
    if (menuTypeFromUrl) params.set("menuType", menuTypeFromUrl);
    const pin = (location.pincode ?? "").replace(/\D/g, "").slice(0, 6);
    if (/^\d{6}$/.test(pin)) params.set("pincode", pin);
    fetch(`/api/products?${params.toString()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        const list = Array.isArray(data?.data) ? data.data : [];
        setProducts(
          list.map((p: { id: string; name: string; price: number; oldPrice?: number; rating: number; reviews: number; imageUrl?: string | null }) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            rating: p.rating ?? 0,
            reviews: p.reviews ?? 0,
            imageUrl: p.imageUrl,
          }))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [searchTerm, location.pincode, categorySlugFromUrl, menuTypeFromUrl]);

  useEffect(() => {
    setQuery(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    const params = new URLSearchParams({ q: term });
    if (categorySlugFromUrl) params.set("categorySlug", categorySlugFromUrl);
    if (menuTypeFromUrl) params.set("menuType", menuTypeFromUrl);
    window.location.href = `/search?${params.toString()}`;
  };

  const scopeHint =
    menuTypeFromUrl === "deals"
      ? "Deals"
      : menuTypeFromUrl === "new-arrivals"
        ? "New arrivals"
        : menuTypeFromUrl === "best-sellers"
          ? "Best sellers"
          : categorySlugFromUrl
            ? categorySlugFromUrl
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(" ")
            : null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and title */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#FF6A00] focus:outline-none bg-white text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </form>

          {searchTerm && (
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              Results for <span className="text-[#FF6A00]">&quot;{searchTerm}&quot;</span>
              {scopeHint ? (
                <span className="block mt-1 text-base font-semibold capitalize text-slate-600 sm:text-lg">
                  in {scopeHint}
                </span>
              ) : null}
            </h1>
          )}
        </div>

        {!searchTerm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Search for products</h2>
            <p className="text-slate-600 mb-6">Enter a product name or keyword in the search bar above.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00]"
            >
              Browse home
            </Link>
          </div>
        )}

        {searchTerm && loading && (
          <div className="py-16 text-center text-slate-500 font-medium">Loading search results…</div>
        )}

        {searchTerm && error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-red-600 font-medium">Failed to load results. Please try again.</p>
            <button
              type="button"
              onClick={() => fetchProducts()}
              className="mt-4 px-6 py-2 bg-slate-100 text-slate-800 rounded-xl font-semibold hover:bg-slate-200"
            >
              Retry
            </button>
          </div>
        )}

        {searchTerm && !loading && !error && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <SearchX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No products found</h2>
            <p className="text-slate-600 mb-6">
              We couldn&apos;t find any products matching &quot;{searchTerm}&quot;. Try different keywords.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00]"
            >
              Browse all products
            </Link>
          </div>
        )}

        {searchTerm && !loading && !error && products.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-slate-600 font-medium">
                {products.length} {products.length === 1 ? "result" : "results"}
              </p>
              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-[#FF6A00] hover:text-[#FF6A00]"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <Link href={`/product/${product.slug ?? product.id}`} className="block">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                          <ShoppingCart className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      {product.oldPrice != null && product.oldPrice > product.price && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          SALE
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${product.slug ?? product.id}`}>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-[#FF6A00] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-slate-500 ml-1">
                        {product.rating.toFixed(1)} ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-slate-900">{formatRupee(product.price)}</span>
                      {product.oldPrice != null && product.oldPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through">{formatRupee(product.oldPrice)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={addingToCartId === product.id}
                      onClick={async () => {
                        setAddingToCartId(product.id);
                        try {
                          const res = await fetch("/api/cart/items", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              productId: product.id,
                              quantity: 1,
                              variantKey: null,
                            }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            if (res.status === 401 || res.status === 403) {
                              addToGuestCart({
                                productId: product.id,
                                quantity: 1,
                                variantKey: null,
                                name: product.name,
                                price: product.price,
                                imageUrl: product.imageUrl ?? null,
                                mrp: product.oldPrice ?? product.price,
                              });
                              toast.success("Added to cart");
                              openCartDrawer();
                            } else {
                              toast.error(data?.error?.message ?? "Could not add to cart.");
                            }
                            return;
                          }
                          toast.success("Added to cart");
                          openCartDrawer();
                        } catch {
                          toast.error("Could not add to cart.");
                        } finally {
                          setAddingToCartId(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors disabled:opacity-60"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {addingToCartId === product.id ? "Adding…" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
