"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { CategoryNav } from "./CategoryNav";
import { Footer } from "./Footer";
import {
  ChevronRight,
  Star,
  Heart,
  Filter,
  Truck,
  Percent,
  CreditCard,
  Smartphone,
  Tag,
} from "lucide-react";
import type { ProductListItem } from "@/types/catalog";
import { getBaseUrl } from "@/services/client";

export type CategoryPageProps = {
  categoryName: string;
  categorySlug: string;
  products: ProductListItem[];
  /** Category slug for API (e.g. electronics). */
  apiCategorySlug?: string;
  /** Subcategory slug for API when on a subcategory page (e.g. mobiles). */
  apiSubCategorySlug?: string;
};

const DISCOUNT_OPTIONS = [
  { label: "10% and above", minPercent: 10 },
  { label: "25% and above", minPercent: 25 },
  { label: "50% and above", minPercent: 50 },
];

function getDiscountPercent(price: number, oldPrice: number): number {
  if (oldPrice <= 0 || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function CategoryPage({
  categoryName,
  categorySlug,
  products,
  apiCategorySlug,
  apiSubCategorySlug,
}: CategoryPageProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(!!apiCategorySlug);
  const [ratingFacets, setRatingFacets] = useState<{ minRating: number; label: string; count: number }[]>([]);
  const [ratingFacetsLoading, setRatingFacetsLoading] = useState(!!apiCategorySlug);
  const [priceMax, setPriceMax] = useState(150000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    if (!apiCategorySlug) {
      setBrandsLoading(false);
      setRatingFacetsLoading(false);
      return;
    }
    const params = new URLSearchParams({ categorySlug: apiCategorySlug });
    if (apiSubCategorySlug) params.set("subCategorySlug", apiSubCategorySlug);
    const base = getBaseUrl();
    Promise.all([
      fetch(`${base}/api/products/brands?${params.toString()}`, { credentials: "include" })
        .then((res) => res.json())
        .then((json) => {
          if (json?.data && Array.isArray(json.data)) setBrands(json.data);
        })
        .catch(() => setBrands([])),
      fetch(`${base}/api/products/rating-facets?${params.toString()}`, { credentials: "include" })
        .then((res) => res.json())
        .then((json) => {
          if (json?.data && Array.isArray(json.data)) setRatingFacets(json.data);
        })
        .catch(() => setRatingFacets([])),
    ]).finally(() => {
      setBrandsLoading(false);
      setRatingFacetsLoading(false);
    });
  }, [apiCategorySlug, apiSubCategorySlug]);

  const filtered = useMemo(() => {
    let list = [...products];
    list = list.filter((p) => p.price <= priceMax);
    if (selectedBrands.length > 0) {
      list = list.filter((p) =>
        selectedBrands.some((b) => p.name.toLowerCase().includes(b.toLowerCase()))
      );
    }
    if (minRating != null) list = list.filter((p) => p.rating >= minRating);
    if (minDiscount != null) {
      list = list.filter((p) => {
        if (p.oldPrice == null || p.oldPrice <= p.price) return false;
        return getDiscountPercent(p.price, p.oldPrice) >= minDiscount;
      });
    }
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "popularity") list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    return list;
  }, [products, priceMax, selectedBrands, minRating, minDiscount, sortBy]);

  const clearFilters = () => {
    setPriceMax(150000);
    setSelectedBrands([]);
    setMinRating(null);
    setInStockOnly(true);
    setMinDiscount(null);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const start = 1;
  const end = Math.min(9, filtered.length);
  const total = filtered.length;
  const resultsText = total === 0 ? "0 results" : `(${start}-${end} of ${total} results)`;

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "#FFFFFF", fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar />
      <CategoryNav onCategoryClick={() => router.push("/category/mobile-phones")} />

      {/* Breadcrumb: Category > Category (current in orange) */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-[#FF6A00] transition">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">{categoryName}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-[#FF6A00]">{categoryName}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pb-8 flex gap-6">
        {/* Left sidebar - Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center gap-2 font-bold text-[#111827] text-base">
                <Filter className="w-4 h-4" />
                Filters
              </span>
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-[#FF6A00] hover:text-[#E55F00]"
              >
                Clear All
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-bold text-[#111827] text-sm mb-3">Price Range</h4>
              <input
                type="range"
                min="0"
                max="150000"
                step="1000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#FF6A00]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹0</span>
                <span>₹{priceMax.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Brands (from API) */}
            <div className="mb-6">
              <h4 className="font-bold text-[#111827] text-sm mb-3">Brands</h4>
              {brandsLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : brands.length === 0 ? (
                <p className="text-sm text-gray-500">No brands for this category.</p>
              ) : (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Ratings (from API) */}
            <div className="mb-6">
              <h4 className="font-bold text-[#111827] text-sm mb-3">Customer Ratings</h4>
              {ratingFacetsLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : ratingFacets.length === 0 ? (
                <p className="text-sm text-gray-500">No ratings data.</p>
              ) : (
                <div className="space-y-2">
                  {ratingFacets.map((opt) => (
                    <label key={opt.minRating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === opt.minRating}
                        onChange={() => setMinRating(minRating === opt.minRating ? null : opt.minRating)}
                        className="w-4 h-4 border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      {opt.count >= 0 && (
                        <span className="text-xs text-gray-500">({opt.count})</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h4 className="font-bold text-[#111827] text-sm mb-3">Availability</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                />
                <span className="text-sm text-gray-700">In Stock</span>
              </label>
            </div>

            {/* Discount */}
            <div>
              <h4 className="font-bold text-[#111827] text-sm mb-3">Discount</h4>
              <div className="space-y-2">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount"
                      checked={minDiscount === opt.minPercent}
                      onChange={() =>
                        setMinDiscount(minDiscount === opt.minPercent ? null : opt.minPercent)
                      }
                      className="w-4 h-4 border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title, results count, sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h1
              className="font-extrabold text-[#2B2B2B]"
              style={{
                fontFamily: "'Nunito', 'Manrope', sans-serif",
                fontSize: 22,
                lineHeight: "28px",
              }}
            >
              {categoryName}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500">{resultsText}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00]"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-xl">
              <p className="text-gray-600 font-medium">No products match your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-3 text-[#FF6A00] font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((product) => {
                const discountPct =
                  product.oldPrice != null && product.oldPrice > product.price
                    ? getDiscountPercent(product.price, product.oldPrice)
                    : 0;
                return (
                  <div
                    key={product.id}
                    className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col"
                  >
                    <Link href={`/product/${product.id}`} className="block flex-1">
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                            No image
                          </div>
                        )}
                        {discountPct > 0 && (
                          <span
                            className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
                            style={{ background: "#EF4444" }}
                          >
                            SALE {discountPct}% OFF
                          </span>
                        )}
                        <button
                          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition shadow"
                          aria-label="Wishlist"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-medium text-[#111827] line-clamp-2 text-sm leading-snug mb-2 group-hover:text-[#FF6A00] transition-colors">
                          {product.name}
                        </h3>
                        <div
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-[#0F766E] bg-[#CCFBF1] w-fit mb-2"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {product.rating.toFixed(1)} ({product.reviews.toLocaleString()})
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-auto">
                          <span className="font-bold text-[#FF6A00] text-lg">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.oldPrice != null && product.oldPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.oldPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Truck className="w-3.5 h-3.5" />
                          Free delivery by Tomorrow
                        </p>
                      </div>
                    </Link>
                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        className="flex-1 py-2.5 rounded-lg border-2 border-[#FF6A00] text-[#FF6A00] font-semibold text-sm hover:bg-[#FFF4EC] transition"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        Add to cart
                      </button>
                      <button
                        className="flex-1 py-2.5 rounded-lg bg-[#FF6A00] text-white font-semibold text-sm hover:bg-[#E55F00] transition"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Promo offers strip */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Percent,
                bg: "bg-[#FFF4EC]",
                title: "10% Instant Discount",
                desc: "On All HDFC Debit Cards",
              },
              {
                icon: CreditCard,
                bg: "bg-[#EFF6FF]",
                title: "No Cost EMI",
                desc: "Starting from ₹1,000",
              },
              {
                icon: Smartphone,
                bg: "bg-[#F5F3FF]",
                title: "UPI Cashback",
                desc: "Up to ₹500 on first order",
              },
              {
                icon: Tag,
                bg: "bg-[#ECFDF5]",
                title: "Extra 5% Off",
                desc: "With Coupon SAVE5",
              },
            ].map((offer) => (
              <div
                key={offer.title}
                className={`${offer.bg} rounded-xl p-4 flex flex-col gap-2 border border-gray-100`}
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <offer.icon className="w-5 h-5 text-[#FF6A00]" />
                </div>
                <p className="font-bold text-[#111827] text-sm">{offer.title}</p>
                <p className="text-xs text-gray-600">{offer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
