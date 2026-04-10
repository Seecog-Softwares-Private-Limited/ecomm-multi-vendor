"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Plus,
  Minus,
  Tag,
  Lock,
  CreditCard,
  Shield,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import {
  getGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
  type GuestCartItem,
} from "@/lib/guest-cart";

type CartItemApi = {
  id: string;
  productId: string;
  quantity: number;
  variantKey: string | null;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    mrp: number;
    stock: number;
    status: string;
    imageUrl: string | null;
    gstPercent: number | null;
  };
};

function guestToDisplayItem(g: GuestCartItem): CartItemApi {
  const id = `guest-${g.productId}-${g.variantKey ?? ""}`;
  return {
    id,
    productId: g.productId,
    quantity: g.quantity,
    variantKey: g.variantKey,
    product: {
      id: g.productId,
      name: g.name,
      sellingPrice: g.price,
      mrp: g.mrp ?? g.price,
      gstPercent: null,
      stock: 99,
      status: "ACTIVE",
      imageUrl: g.imageUrl,
    },
  };
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

export function ShoppingCartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemApi[]>([]);
  const [isGuestCart, setIsGuestCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        const guestItems = getGuestCart().map(guestToDisplayItem);
        setItems(guestItems);
        setIsGuestCart(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        toast.error("Could not load cart.");
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data?.data?.items ?? []);
      setIsGuestCart(false);
    } catch {
      toast.error("Could not load cart.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = items.reduce(
    (sum, it) => sum + it.product.sellingPrice * it.quantity,
    0
  );
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = items.reduce(
    (sum, it) => sum + it.product.sellingPrice * it.quantity * ((it.product.gstPercent ?? 0) / 100),
    0
  );
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const handleQuantityChange = async (cartItemId: string, newQty: number) => {
    if (newQty < 1 || newQty > 99) return;
    const it = items.find((i) => i.id === cartItemId);
    if (!it) return;
    if (isGuestCart) {
      setUpdatingId(cartItemId);
      updateGuestCartQuantity(it.productId, it.variantKey, newQty);
      setItems(getGuestCart().map(guestToDisplayItem));
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
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error?.message ?? "Could not update quantity.");
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: newQty } : i
        )
      );
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
      setItems(getGuestCart().map(guestToDisplayItem));
      setRemovingId(null);
      toast.success("Item removed from cart.");
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
        setRemovingId(null);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      toast.success("Item removed from cart.");
    } catch {
      toast.error("Could not remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toLowerCase() === "save10") {
      setCouponApplied(true);
      toast.success("Coupon applied!");
    } else {
      toast.error("Invalid coupon code.");
    }
  };

  const parseVariantKey = (variantKey: string | null) => {
    if (!variantKey) return [];
    return variantKey.split("|").map((part) => {
      const [label, value] = part.split(":");
      return { label: label ?? "Option", value: value ?? "" };
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <TopBar />
        <Navbar />
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-12 flex items-center justify-center min-h-[400px]">
          <p className="text-[#6B7280] font-medium">Loading cart…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen bg-[#F9FAFB]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#111827]"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Shopping Cart
          </h1>
          <p className="text-[#6B7280] text-[15px] mt-1">
            Review your items and proceed to checkout
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-10 text-center">
            <ShoppingBag className="w-16 h-16 text-[#D1D5DB] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#374151] mb-2">Your cart is empty</h2>
            <p className="text-[#6B7280] mb-6">Add items from the store to get started.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#FF6A00] text-white font-semibold rounded-xl hover:bg-[#E55F00] transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {subtotal < 500 && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3 text-white"
                  style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 100%)" }}
                >
                  <Truck className="w-6 h-6 shrink-0" />
                  <p className="font-semibold text-[15px]">
                    Add <span className="font-bold">₹{(500 - subtotal).toFixed(0)}</span> more to get
                    FREE shipping!
                  </p>
                </div>
              )}

              {items.map((it) => {
                const img = it.product.imageUrl || PLACEHOLDER_IMAGE;
                const variants = parseVariantKey(it.variantKey);
                const isUpdating = updatingId === it.id;
                const isRemoving = removingId === it.id;

                return (
                  <div
                    key={it.id}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      <Link
                        href={`/product/${it.productId}`}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0"
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
                            href={`/product/${it.productId}`}
                            className="font-bold text-[#111827] text-[17px] hover:text-[#FF6A00] transition line-clamp-2"
                          >
                            {it.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemove(it.id)}
                            disabled={isRemoving}
                            className="text-[#6B7280] hover:text-[#DC2626] p-2 rounded-lg hover:bg-[#FEF2F2] transition shrink-0 disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        {variants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {variants.map((v, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-md text-[13px] font-medium bg-[#FFF4EC] text-[#FF6A00] border border-[#FFE4CC]"
                              >
                                {v.label}: {v.value}
                              </span>
                            ))}
                          </div>
                        )}
                        {it.product.stock > 0 && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                            <span className="text-[13px] font-medium text-[#16A34A]">In Stock</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                          <div className="flex items-center border border-[#D1D5DC] rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(it.id, it.quantity - 1)}
                              disabled={it.quantity <= 1 || isUpdating}
                              className="w-9 h-9 flex items-center justify-center bg-[#F9FAFB] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4 text-[#374151]" />
                            </button>
                            <span className="w-10 text-center font-bold text-[15px] text-[#111827]">
                              {it.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(it.id, it.quantity + 1)}
                              disabled={it.quantity >= 99 || isUpdating}
                              className="w-9 h-9 flex items-center justify-center bg-[#F9FAFB] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4 text-[#374151]" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[18px] text-[#111827]">
                              ₹{(it.product.sellingPrice * it.quantity).toLocaleString("en-IN")}
                            </p>
                            <p className="text-[13px] text-[#6B7280]">
                              ₹{it.product.sellingPrice.toLocaleString("en-IN")} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link
                href="/"
                className="block w-full text-center py-3.5 border-2 border-[#E5E7EB] rounded-xl font-semibold text-[#6B7280] hover:border-[#FF6A00] hover:text-[#FF6A00] hover:bg-[#FFF4EC] transition bg-white"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#111827] mb-5">Order Summary</h2>

                <div className="mb-5 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  <div className="relative mb-3">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-5 h-5" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      disabled={couponApplied}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#D1D5DC] rounded-lg focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] outline-none transition text-[15px] disabled:opacity-60"
                    />
                  </div>
                  {couponApplied ? (
                    <div className="py-2 px-4 rounded-lg font-semibold text-center text-[#16A34A] bg-[#DCFCE7] border border-[#86EFAC]">
                      ✓ Coupon Applied!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="w-full py-2.5 rounded-lg font-semibold text-white bg-[#374151] hover:bg-[#4B5563] transition"
                    >
                      Apply Coupon
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-5 pb-5 border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-[#16A34A] font-semibold">Discount (10%)</span>
                      <span className="font-semibold text-[#16A34A]">
                        -₹{discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6B7280]">Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-[#16A34A]">FREE</span>
                    ) : (
                      <span className="font-semibold text-[#111827]">
                        ₹{shipping.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#6B7280]">Tax</span>
                    <span className="font-semibold text-[#111827]">
                      ₹{tax.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {discount > 0 && (
                  <div className="mb-5 p-3 rounded-xl bg-[#DCFCE7] border border-[#86EFAC]">
                    <p className="text-[#16A34A] font-bold text-center text-[14px]">
                      You're saving ₹{discount.toLocaleString("en-IN")}!
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-baseline mb-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  <span className="text-lg font-bold text-[#111827]">Total</span>
                  <span className="text-2xl font-bold text-[#FF6A00]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    isGuestCart
                      ? router.push("/login?returnUrl=" + encodeURIComponent("/checkout"))
                      : router.push("/checkout")
                  }
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg bg-[#FF6A00] hover:bg-[#E55F00]"
                >
                  <Lock className="w-5 h-5" />
                  {isGuestCart ? "Sign in to Checkout" : "Secure Checkout"}
                </button>

                <div className="space-y-3 pt-5 mt-5 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Shield className="w-5 h-5 text-[#16A34A] shrink-0" />
                    <span>SSL Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <CreditCard className="w-5 h-5 text-[#FF6A00] shrink-0" />
                    <span>Multiple Payment Options</span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Truck className="w-5 h-5 text-[#F59E0B] shrink-0" />
                    <span>Free returns within 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
