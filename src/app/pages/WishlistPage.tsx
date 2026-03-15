"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, X, Star } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { toast } from "sonner";

type WishlistProduct = {
  id: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  stock: number;
  status: string;
  avgRating: number | null;
  imageUrl: string | null;
};

type WishlistItem = {
  id: string;
  productId: string;
  variantKey: string | null;
  product: WishlistProduct;
};

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const fetchWishlist = useCallback(() => {
    fetch("/api/wishlist", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        if (data?.data?.items) setItems(data.data.items);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (wishlistItemId: string) => {
    setRemovingId(wishlistItemId);
    try {
      const res = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to remove");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    if (items.length === 0) return;
    if (!confirm("Remove all items from your wishlist?")) return;
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to clear");
        return;
      }
      setItems([]);
      toast.success("Wishlist cleared");
    } catch {
      toast.error("Failed to clear");
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCartId(productId);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Could not add to cart");
        return;
      }
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  const inStock = (item: WishlistItem) => item.product.stock > 0 && item.product.status === "ACTIVE";

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">My Wishlist</h1>
            <p className="text-slate-600">{items.length} items</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-5 py-2.5 border-2 border-slate-200 text-slate-700 hover:border-red-500 hover:text-red-600 rounded-xl font-semibold transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">Loading wishlist…</div>
        )}

        {error && (
          <div className="py-12 text-center text-red-600 font-medium">
            Failed to load wishlist. Please try again.
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center text-slate-600">
            <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="font-medium">Your wishlist is empty.</p>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00]"
            >
              Browse products
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#DC2626] hover:text-white transition-colors shadow-lg disabled:opacity-50"
                  aria-label="Remove from wishlist"
                >
                  <X className="w-5 h-5" />
                </button>

                {item.product.mrp > item.product.sellingPrice && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#DC2626] text-white text-sm font-bold rounded-lg">
                    Sale
                  </div>
                )}

                {!inStock(item) && (
                  <div className="absolute bottom-40 left-0 right-0 bg-gray-900/90 text-white text-center py-3 font-bold">
                    Out of Stock
                  </div>
                )}

                <Link href={`/product/${item.productId}`} className="block">
                  <div
                    className={`aspect-[4/5] bg-slate-100 flex items-center justify-center ${
                      item.product.imageUrl ? "" : "bg-gradient-to-br from-slate-200 to-slate-300"
                    } group-hover:scale-[1.02] transition-transform duration-300`}
                  >
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Heart className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          (item.product.avgRating ?? 0) >= i
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({item.product.avgRating?.toFixed(1) ?? "0"})
                    </span>
                  </div>

                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-semibold text-[#111827] mb-2 hover:text-[#FF6A00] transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-xl font-bold text-[#111827]">
                      {formatRupee(item.product.sellingPrice)}
                    </p>
                    {item.product.mrp > item.product.sellingPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatRupee(item.product.mrp)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!inStock(item) || addingToCartId === item.productId}
                    onClick={() => handleAddToCart(item.productId)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      inStock(item)
                        ? "bg-[#FF6A00] text-white hover:bg-[#E55F00] shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    } disabled:opacity-70`}
                  >
                    {addingToCartId === item.productId
                      ? "Adding…"
                      : inStock(item)
                        ? "Add to Cart"
                        : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
