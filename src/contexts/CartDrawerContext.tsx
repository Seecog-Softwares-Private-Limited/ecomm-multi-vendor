"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  getGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
  subscribeToGuestCartChanges,
  type GuestCartItem,
} from "@/lib/guest-cart";

const CART_UPDATED_EVENT = "indovyapar-cart-updated";

type CartDrawerItem = {
  id: string;
  productId: string;
  quantity: number;
  variantKey: string | null;
  product: {
    id: string;
    name: string;
    slug?: string | null;
    sellingPrice: number;
    mrp: number;
    imageUrl: string | null;
  };
};

function guestToDrawerItem(g: GuestCartItem): CartDrawerItem {
  return {
    id: `guest-${g.productId}-${g.variantKey ?? ""}`,
    productId: g.productId,
    quantity: g.quantity,
    variantKey: g.variantKey,
    product: {
      id: g.productId,
      name: g.name,
      slug: null,
      sellingPrice: g.price,
      mrp: g.mrp ?? g.price,
      imageUrl: g.imageUrl,
    },
  };
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

function parseVariantKey(variantKey: string | null): { label: string; value: string }[] {
  if (!variantKey) return [];
  return variantKey.split("|").map((part) => {
    const [label, value] = part.split(":");
    return { label: label ?? "Option", value: value ?? "" };
  });
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function dispatchCartUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

type CartDrawerContextValue = {
  isOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
};

const CartDrawerContext = React.createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = React.useContext(CartDrawerContext);
  if (!ctx) {
    return {
      isOpen: false,
      openCartDrawer: () => {},
      closeCartDrawer: () => {},
    };
  }
  return ctx;
}

type CartDrawerProviderProps = { children: React.ReactNode };

export function CartDrawerProvider({ children }: CartDrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openCartDrawer = useCallback(() => setIsOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(
    () => ({ isOpen, openCartDrawer, closeCartDrawer }),
    [isOpen, openCartDrawer, closeCartDrawer]
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawerPanel isOpen={isOpen} onClose={closeCartDrawer} />
    </CartDrawerContext.Provider>
  );
}

type CartDrawerPanelProps = { isOpen: boolean; onClose: () => void };

function CartDrawerPanel({ isOpen, onClose }: CartDrawerPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartDrawerItem[]>([]);
  const [isGuestCart, setIsGuestCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        const guestItems = getGuestCart().map(guestToDrawerItem);
        setItems(guestItems);
        setIsGuestCart(true);
        return;
      }
      if (!res.ok) {
        setItems([]);
        setIsGuestCart(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const list = data?.data?.items ?? [];
      setItems(
        list.map((i: CartDrawerItem) => ({
          id: i.id,
          productId: i.productId,
          quantity: i.quantity,
          variantKey: i.variantKey,
          product: {
            id: i.product?.id ?? i.productId,
            name: i.product?.name ?? "",
            sellingPrice: i.product?.sellingPrice ?? 0,
            mrp: i.product?.mrp ?? i.product?.sellingPrice ?? 0,
            imageUrl: i.product?.imageUrl ?? null,
          },
        }))
      );
      setIsGuestCart(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen, fetchCart]);

  useEffect(() => {
    if (!isOpen || !isGuestCart) return;
    const unsub = subscribeToGuestCartChanges(() => {
      setItems(getGuestCart().map(guestToDrawerItem));
    });
    return unsub;
  }, [isOpen, isGuestCart]);

  const handleQuantityChange = async (cartItemId: string, delta: number) => {
    const it = items.find((i) => i.id === cartItemId);
    if (!it) return;
    const newQty = Math.max(1, Math.min(99, it.quantity + delta));
    if (newQty === it.quantity) return;

    if (isGuestCart) {
      setUpdatingId(cartItemId);
      updateGuestCartQuantity(it.productId, it.variantKey, newQty);
      setItems(getGuestCart().map(guestToDrawerItem));
      dispatchCartUpdated();
      setUpdatingId(null);
      return;
    }
    setUpdatingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQty }),
      });
      if (!res.ok) {
        toast.error("Could not update quantity.");
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i))
      );
      dispatchCartUpdated();
    } catch {
      toast.error("Could not update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    const it = items.find((i) => i.id === cartItemId);
    if (!it) return;
    if (isGuestCart) {
      setRemovingId(cartItemId);
      removeFromGuestCart(it.productId, it.variantKey);
      setItems(getGuestCart().map(guestToDrawerItem));
      dispatchCartUpdated();
      toast.success("Item removed from cart.");
      setRemovingId(null);
      return;
    }
    setRemovingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Could not remove item.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      dispatchCartUpdated();
      toast.success("Item removed from cart.");
    } catch {
      toast.error("Could not remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.sellingPrice * i.quantity,
    0
  );
  const freeShippingThreshold = 500;
  const qualifiesFreeShipping = subtotal >= freeShippingThreshold;

  const handleCheckout = () => {
    onClose();
    if (isGuestCart) {
      router.push("/login?returnUrl=" + encodeURIComponent("/checkout"));
    } else {
      router.push("/checkout");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[120] transition-opacity"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[130] flex flex-col animate-in slide-in-from-right duration-300"
        style={{ fontFamily: "'Manrope', sans-serif" }}
        role="dialog"
        aria-label="Your cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-[#111827]">
            Your cart ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {!qualifiesFreeShipping && subtotal > 0 && (
          <div className="mx-5 mt-4 p-3 rounded-xl flex items-center gap-3 text-white bg-gradient-to-r from-[#FF6A00] to-[#E55F00]">
            <Truck className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">
              Add <span className="font-bold">{formatPrice(freeShippingThreshold - subtotal)}</span> more for FREE shipping
            </p>
          </div>
        )}
        {qualifiesFreeShipping && items.length > 0 && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Free Shipping
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              Loading cart…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-600 font-medium mb-2">Your cart is empty</p>
              <p className="text-slate-500 text-sm mb-4">Add items from the store to get started.</p>
              <Link
                href="/"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#FF6A00] text-white font-semibold rounded-xl hover:bg-[#E55F00] transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => {
                const img = it.product.imageUrl || PLACEHOLDER_IMAGE;
                const variants = parseVariantKey(it.variantKey);
                const isUpdating = updatingId === it.id;
                const isRemoving = removingId === it.id;
                return (
                  <li
                    key={it.id}
                    className="flex gap-4 pb-4 border-b border-slate-100 last:border-0"
                  >
                    <Link
                      href={`/product/${it.product.slug ?? it.productId}`}
                      onClick={onClose}
                      className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0"
                    >
                      <img
                        src={img}
                        alt={it.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${it.product.slug ?? it.productId}`}
                          onClick={onClose}
                          className="font-semibold text-[#111827] text-sm line-clamp-2 hover:text-[#FF6A00]"
                        >
                          {it.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(it.id)}
                          disabled={isRemoving}
                          className="text-slate-400 hover:text-red-600 p-1 rounded shrink-0 disabled:opacity-50"
                          aria-label="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {variants.length > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {variants.map((v) => `${v.label}: ${v.value}`).join(", ")}
                        </p>
                      )}
                      <p className="text-[#FF6A00] font-bold text-sm mt-1">
                        {formatPrice(it.product.sellingPrice * it.quantity)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(it.id, -1)}
                          disabled={isUpdating || it.quantity <= 1}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-700">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(it.id, 1)}
                          disabled={isUpdating || it.quantity >= 99}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 bg-slate-50 shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-[#111827]">Total</span>
              <span className="text-xl font-bold text-[#111827]">
                {formatPrice(subtotal)}
              </span>
            </div>
            {qualifiesFreeShipping && (
              <p className="text-emerald-600 text-sm font-medium mb-3">Free Shipping</p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition flex items-center justify-center gap-2"
            >
              {isGuestCart ? "Sign in to Checkout" : "Checkout Now →"}
            </button>
            <Link
              href="/cart"
              onClick={onClose}
              className="block text-center text-sm text-[#FF6A00] font-medium mt-3 hover:underline"
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
