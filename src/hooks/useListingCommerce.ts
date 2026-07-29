"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartDrawer, dispatchCartUpdated } from "@/contexts/CartDrawerContext";
import {
  addToGuestCart,
  getGuestCart,
  removeFromGuestCart,
  subscribeToGuestCartChanges,
  updateGuestCartQuantity,
} from "@/lib/guest-cart";
import type { ProductCardProduct } from "@/lib/product/product-card-utils";

const CART_UPDATED_EVENT = "indovyapar-cart-updated";

type CartEntry = { cartItemId: string; quantity: number };

export function useListingCommerce() {
  const router = useRouter();
  const pathname = usePathname();
  const { openCartDrawer } = useCartDrawer();

  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  const [wishlistByProductId, setWishlistByProductId] = useState<Record<string, string>>({});
  const [cartByProductId, setCartByProductId] = useState<Record<string, CartEntry>>({});
  const [guestQtyByProductId, setGuestQtyByProductId] = useState<Record<string, number>>({});
  const [wishlistTogglingId, setWishlistTogglingId] = useState<string | null>(null);
  const [cartActionProductId, setCartActionProductId] = useState<string | null>(null);

  const syncGuestCart = useCallback(() => {
    const map: Record<string, number> = {};
    for (const item of getGuestCart()) {
      if (item.variantKey) continue;
      map[item.productId] = (map[item.productId] ?? 0) + item.quantity;
    }
    setGuestQtyByProductId(map);
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, CartEntry> = {};
      for (const row of data?.data?.items ?? []) {
        if (row.variantKey) continue;
        map[row.productId] = { cartItemId: row.id, quantity: row.quantity };
      }
      setCartByProductId(map);
    } catch {
      /* ignore */
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, string> = {};
      for (const item of data?.data?.items ?? []) {
        map[item.productId] = item.id;
      }
      setWishlistByProductId(map);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/me", { credentials: "include" });
        if (!me.ok) {
          syncGuestCart();
          return;
        }
        const meData = await me.json();
        const isCustomer = meData?.data?.user?.role === "CUSTOMER";
        if (cancelled) return;
        setCustomerLoggedIn(isCustomer);
        if (isCustomer) {
          await Promise.all([loadWishlist(), loadCart()]);
        } else {
          syncGuestCart();
        }
      } catch {
        syncGuestCart();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCart, loadWishlist, syncGuestCart]);

  useEffect(() => {
    const onCartUpdated = () => {
      if (customerLoggedIn) void loadCart();
      else syncGuestCart();
    };
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
  }, [customerLoggedIn, loadCart, syncGuestCart]);

  useEffect(() => {
    if (customerLoggedIn) return;
    return subscribeToGuestCartChanges(syncGuestCart);
  }, [customerLoggedIn, syncGuestCart]);

  const getCartQuantity = useCallback(
    (productId: string) => {
      if (customerLoggedIn) return cartByProductId[productId]?.quantity ?? 0;
      return guestQtyByProductId[productId] ?? 0;
    },
    [cartByProductId, customerLoggedIn, guestQtyByProductId]
  );

  const isWishlisted = useCallback(
    (productId: string) => Boolean(wishlistByProductId[productId]),
    [wishlistByProductId]
  );

  const toggleWishlist = useCallback(
    async (product: ProductCardProduct) => {
      if (!customerLoggedIn) {
        const ret = pathname && pathname !== "/login" ? pathname : "/";
        router.push(`/login?returnUrl=${encodeURIComponent(ret)}`);
        toast.info("Sign in to save items to your wishlist.");
        return;
      }
      setWishlistTogglingId(product.id);
      try {
        const itemId = wishlistByProductId[product.id];
        if (itemId) {
          const res = await fetch(`/api/wishlist/${itemId}`, {
            method: "DELETE",
            credentials: "include",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            toast.error(data?.error?.message ?? "Could not update wishlist.");
            return;
          }
          setWishlistByProductId((prev) => {
            const next = { ...prev };
            delete next[product.id];
            return next;
          });
          toast.success("Removed from wishlist");
          return;
        }
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product.id, variantKey: null }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data?.error?.message ?? "Could not add to wishlist.");
          return;
        }
        const newId = data?.data?.id;
        if (typeof newId === "string") {
          setWishlistByProductId((prev) => ({ ...prev, [product.id]: newId }));
        }
        toast.success("Added to wishlist");
      } catch {
        toast.error("Could not update wishlist.");
      } finally {
        setWishlistTogglingId(null);
      }
    },
    [customerLoggedIn, pathname, router, wishlistByProductId]
  );

  const addToCart = useCallback(
    async (product: ProductCardProduct) => {
      setCartActionProductId(product.id);
      try {
        const res = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product.id, quantity: 1, variantKey: null }),
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
            return;
          }
          toast.error(data?.error?.message ?? "Could not add to cart.");
          return;
        }
        toast.success("Added to cart");
        dispatchCartUpdated();
        openCartDrawer();
      } catch {
        toast.error("Could not add to cart.");
      } finally {
        setCartActionProductId(null);
      }
    },
    [openCartDrawer]
  );

  const updateCartQuantity = useCallback(
    async (product: ProductCardProduct, nextQty: number) => {
      setCartActionProductId(product.id);
      try {
        if (!customerLoggedIn) {
          if (nextQty < 1) {
            removeFromGuestCart(product.id, null);
          } else {
            const existing = getGuestCart().find(
              (x) => x.productId === product.id && !x.variantKey
            );
            if (existing) updateGuestCartQuantity(product.id, null, nextQty);
            else {
              addToGuestCart({
                productId: product.id,
                quantity: nextQty,
                variantKey: null,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl ?? null,
                mrp: product.oldPrice ?? product.price,
              });
            }
          }
          syncGuestCart();
          dispatchCartUpdated();
          return;
        }

        const entry = cartByProductId[product.id];
        if (!entry) return;

        if (nextQty < 1) {
          const res = await fetch(`/api/cart/items/${entry.cartItemId}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            toast.error("Could not update cart.");
            return;
          }
        } else {
          const res = await fetch(`/api/cart/items/${entry.cartItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ quantity: nextQty }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            toast.error(data?.error?.message ?? "Could not update cart.");
            return;
          }
        }
        dispatchCartUpdated();
      } catch {
        toast.error("Could not update cart.");
      } finally {
        setCartActionProductId(null);
      }
    },
    [cartByProductId, customerLoggedIn, syncGuestCart]
  );

  const incrementCart = useCallback(
    (product: ProductCardProduct) => {
      const qty = getCartQuantity(product.id);
      void updateCartQuantity(product, qty + 1);
    },
    [getCartQuantity, updateCartQuantity]
  );

  const decrementCart = useCallback(
    (product: ProductCardProduct) => {
      const qty = getCartQuantity(product.id);
      void updateCartQuantity(product, qty - 1);
    },
    [getCartQuantity, updateCartQuantity]
  );

  return {
    customerLoggedIn,
    getCartQuantity,
    isWishlisted,
    toggleWishlist,
    addToCart,
    incrementCart,
    decrementCart,
    wishlistTogglingId,
    cartActionProductId,
    openCartDrawer,
  };
}

export type ListingCommerce = ReturnType<typeof useListingCommerce>;
