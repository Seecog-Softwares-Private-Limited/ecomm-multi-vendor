"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { WishlistCard } from "@/components/wishlist/WishlistCard";
import { WishlistSkeleton } from "@/components/wishlist/WishlistSkeleton";
import { toast } from "sonner";
import { useCartDrawer, dispatchCartUpdated } from "@/contexts/CartDrawerContext";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import {
  cartItemKey,
  normalizeWishlistItems,
  sortWishlistItems,
  WISHLIST_SORT_OPTIONS,
  type WishlistItem,
  type WishlistSort,
} from "@/lib/wishlist/wishlist-utils";

const CART_UPDATED_EVENT = "indovyapar-cart-updated";
const REMOVE_ANIMATION_MS = 280;

export function WishlistPage() {
  const router = useRouter();
  const { openCartDrawer } = useCartDrawer();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [cartKeys, setCartKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<WishlistSort>("recent");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [buyNowId, setBuyNowId] = useState<string | null>(null);

  const loadCartKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const keys = new Set<string>(
        (data?.data?.items ?? []).map(
          (row: { productId: string; variantKey: string | null }) =>
            cartItemKey(row.productId, row.variantKey)
        )
      );
      setCartKeys(keys);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data?.data?.items) {
        setItems(normalizeWishlistItems(data.data.items));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWishlist();
    void loadCartKeys();
  }, [fetchWishlist, loadCartKeys]);

  useEffect(() => {
    const onCartUpdated = () => void loadCartKeys();
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
  }, [loadCartKeys]);

  const sortedItems = useMemo(() => sortWishlistItems(items, sort), [items, sort]);

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
        setRemovingId(null);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, REMOVE_ANIMATION_MS));
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

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingToCartId(item.id);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
          variantKey: item.variantKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Could not add to cart");
        return;
      }
      toast.success("Added to cart");
      dispatchCartUpdated();
      setCartKeys((prev) => new Set(prev).add(cartItemKey(item.productId, item.variantKey)));
      openCartDrawer();
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleBuyNow = async (item: WishlistItem) => {
    setBuyNowId(item.id);
    try {
      const res = await fetch("/api/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "BUY_NOW",
          lines: [
            {
              productId: item.productId,
              quantity: 1,
              variantKey: item.variantKey,
            },
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error?.message ?? "Could not start checkout.";
        if (res.status === 401 || res.status === 403) {
          toast.error("Please sign in to use Buy Now.");
          router.push("/login?returnUrl=" + encodeURIComponent("/wishlist"));
          return;
        }
        toast.error(message);
        return;
      }
      const sessionId = data?.data?.sessionId as string | undefined;
      if (!sessionId) {
        toast.error("Could not start checkout.");
        return;
      }
      router.push(`/checkout?session=${encodeURIComponent(sessionId)}`);
    } catch {
      toast.error("Could not start checkout.");
    } finally {
      setBuyNowId(null);
    }
  };

  return (
    <AccountLayout>
      <div className="iv-card p-6 shadow-md sm:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900">My Wishlist</h1>
            <p className="text-slate-600">
              {loading ? "Loading…" : `${items.length} item${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {items.length > 0 && (
              <>
                <label htmlFor="wishlist-sort" className="sr-only">
                  Sort wishlist
                </label>
                <select
                  id="wishlist-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as WishlistSort)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                >
                  {WISHLIST_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => void handleClearAll()}
                  className="rounded-xl border-2 border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:border-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {loading && <WishlistSkeleton />}

        {error && (
          <CustomerErrorState
            title="Couldn't load wishlist"
            message="Failed to load wishlist. Please try again."
            onRetry={() => {
              setLoading(true);
              void fetchWishlist();
            }}
          />
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Heart className="h-10 w-10 fill-red-400 text-red-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h2>
            <p className="mt-2 max-w-sm text-slate-600">
              Save products you love so you can find them later.
            </p>
            <Link
              href="/"
              className="iv-btn-primary mt-6 px-8"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {!loading && !error && sortedItems.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((item, index) => (
              <WishlistCard
                key={item.id}
                item={item}
                inCart={cartKeys.has(cartItemKey(item.productId, item.variantKey))}
                isRemoving={removingId === item.id}
                isAddingToCart={addingToCartId === item.id}
                isBuyingNow={buyNowId === item.id}
                onRemove={(id) => void handleRemove(id)}
                onAddToCart={(row) => void handleAddToCart(row)}
                onBuyNow={(row) => void handleBuyNow(row)}
                onGoToCart={() => openCartDrawer()}
                animationDelayMs={Math.min(index * 60, 360)}
              />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
