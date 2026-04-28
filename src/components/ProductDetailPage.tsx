"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  Heart,
  ChevronRight,
  ChevronLeft,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
} from "lucide-react";
import type { ProductDetail, ProductListItem, ProductSkuVariant } from "@/types/catalog";
import {
  buildSkuVariantKey,
  findSkuVariantByKey,
  distinctVariantColors,
  distinctVariantSizes,
} from "@/lib/product-sku-variant";
import { addToGuestCart } from "@/lib/guest-cart";
import { useCartDrawer, dispatchCartUpdated } from "@/contexts/CartDrawerContext";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";
import { addRecentlyViewedId } from "@/lib/recently-viewed";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600";

const EMPTY_SKU_VARIANTS: ProductSkuVariant[] = [] as ProductSkuVariant[];

export type ProductDetailPageProps = {
  product: ProductDetail;
  categoryName: string;
  subCategoryName: string;
  subCategorySlug: string;
  brand: string;
  relatedFromStores?: ProductListItem[];
  relatedToItem?: ProductListItem[];
};

// ─── Related product card (for carousel) ─────────────────────────────────────
function RelatedProductCard({ item }: { item: ProductListItem }) {
  const discountPct =
    item.oldPrice != null && item.oldPrice > item.price && item.oldPrice > 0
      ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
      : 0;
  return (
    <Link
      href={`/product/${item.slug ?? item.id}`}
      className="flex w-[200px] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-lg group sm:w-[220px] md:w-[240px]"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No image
          </div>
        )}
        {discountPct > 0 && (
          <span
            className="absolute bottom-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
            style={{ background: "#16A34A" }}
          >
            {discountPct}% OFF
          </span>
        )}
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition shadow border-0 cursor-pointer"
          aria-label="Wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={16} fill="none" color="#6B7280" />
        </button>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3
          className="font-medium text-[#111827] line-clamp-2 text-sm leading-snug mb-1.5 group-hover:text-[#FF6A00] transition-colors"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {item.name}
        </h3>
        <div className="flex items-center gap-1 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <Star size={12} fill="#FBBF24" color="#FBBF24" />
          <span className="text-xs font-semibold text-[#FF6A00]">{Number(item.rating).toFixed(1)}</span>
          <span className="text-xs text-gray-500">({(item.reviews ?? 0).toLocaleString("en-IN")})</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <span className="font-bold text-[#111827] text-base" style={{ fontFamily: "'Manrope', sans-serif" }}>
            ₹{item.price.toLocaleString("en-IN")}
          </span>
          {item.oldPrice != null && item.oldPrice > item.price && (
            <span className="text-sm text-gray-400 line-through" style={{ fontFamily: "'Manrope', sans-serif" }}>
              ₹{item.oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-1.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <Truck size={12} />
          Free delivery by Tomorrow
        </p>
      </div>
    </Link>
  );
}

// ─── Related products carousel section ───────────────────────────────────────
function RelatedProductsSection({
  title,
  items,
}: {
  title: string;
  items: ProductListItem[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = 260;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-[1360px] px-3 pb-6 sm:px-4 lg:px-10">
      <h2
        className="mb-3 text-lg font-bold text-[#111827] sm:text-xl"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {title}
      </h2>
      <div className="relative flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="hidden sm:flex flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white shadow-sm items-center justify-center hover:bg-gray-50 transition"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} color="#374151" />
        </button>
        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth py-2 sm:gap-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <RelatedProductCard key={item.id} item={item} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden sm:flex flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white shadow-sm items-center justify-center hover:bg-gray-50 transition"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} color="#374151" />
        </button>
      </div>
    </div>
  );
}

// ─── Star Rating Row (dynamic: rating and count from API) ─────────────────────
function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <div className="flex items-center" style={{ gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => {
          const filled = rating >= s;
          return (
            <Star
              key={s}
              size={14}
              fill={filled ? "#FBBF24" : "#E5E7EB"}
              color={filled ? "#FBBF24" : "#E5E7EB"}
            />
          );
        })}
      </div>
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13,
          color: "#FF6A00",
          fontWeight: 600,
        }}
      >
        {Number(rating).toFixed(1)}
      </span>
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13,
          color: "#6B7280",
        }}
      >
        ({count.toLocaleString("en-IN")} ratings)
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProductDetailPage({
  product,
  categoryName,
  subCategoryName,
  subCategorySlug,
  brand,
  relatedFromStores = [],
  relatedToItem = [],
}: ProductDetailPageProps) {
  const router = useRouter();
  const { openCartDrawer } = useCartDrawer();
  const { deliverToLabel, openDeliveryModal, location } = useDeliveryLocation();

  const [deliveryEligible, setDeliveryEligible] = useState<boolean | null>(null);
  const desktopPurchaseRef = useRef<HTMLDivElement | null>(null);
  /** Desktop: show fixed bottom bar when sidebar buy box is off-screen. */
  const [floatingPurchaseVisible, setFloatingPurchaseVisible] = useState(false);

  useEffect(() => {
    addRecentlyViewedId(product.id);
  }, [product.id]);

  useEffect(() => {
    let cancelled = false;
    const pc = (location.pincode ?? "").trim();
    if (!/^\d{6}$/.test(pc)) {
      setDeliveryEligible(true);
      return () => {
        cancelled = true;
      };
    }
    setDeliveryEligible(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(product.id)}/delivery-eligibility?pincode=${encodeURIComponent(pc)}`
        );
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || json?.success !== true) {
          setDeliveryEligible(true);
          return;
        }
        setDeliveryEligible(json?.data?.eligible !== false);
      } catch {
        if (!cancelled) setDeliveryEligible(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id, location.pincode]);

  const [activeImage, setActiveImage] = useState(0);
  const skuVariants =
    product.skuVariants && product.skuVariants.length > 0 ? product.skuVariants : EMPTY_SKU_VARIANTS;
  const hasSkuVariants = skuVariants.length > 0;
  const variations = product.variations ?? [];
  const specifications = product.specifications ?? [];
  const colorVariation = variations.find((v) => v?.name?.toLowerCase() === "color");
  const storageVariation = variations.find(
    (v) => v?.name?.toLowerCase() === "storage" || v?.name?.toLowerCase() === "storage capacity"
  );
  const [selectedColor, setSelectedColor] = useState(colorVariation?.values?.[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState(storageVariation?.values?.[0] ?? "");
  const [skuColor, setSkuColor] = useState<string | null>(null);
  const [skuSize, setSkuSize] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    const el = desktopPurchaseRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setFloatingPurchaseVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product.id]);

  useEffect(() => {
    if (!hasSkuVariants) return;
    const colors = distinctVariantColors(skuVariants);
    const sizesAll = distinctVariantSizes(skuVariants, null);
    if (colors.length > 0) {
      const c0 = colors[0]!;
      setSkuColor(c0);
      setSkuSize(distinctVariantSizes(skuVariants, c0)[0] ?? null);
    } else {
      setSkuColor(null);
      setSkuSize(sizesAll[0] ?? null);
    }
  }, [product.id, hasSkuVariants, product.skuVariants]);

  useEffect(() => {
    if (!hasSkuVariants || distinctVariantColors(skuVariants).length === 0) return;
    const sizes = distinctVariantSizes(skuVariants, skuColor);
    setSkuSize((prev) => (prev != null && sizes.includes(prev) ? prev : sizes[0] ?? null));
  }, [hasSkuVariants, skuColor, product.id, product.skuVariants]);

  const activeSkuVariant = hasSkuVariants
    ? findSkuVariantByKey(skuVariants, buildSkuVariantKey(skuColor, skuSize))
    : null;

  const price = hasSkuVariants
    ? activeSkuVariant?.price ?? Math.min(...skuVariants.map((s) => s.price))
    : Number(product.price) ?? 0;
  const displayStock = hasSkuVariants ? activeSkuVariant?.stock ?? 0 : product.stock;
  const mrp = Number(product.mrp) ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const skuColorOptions = hasSkuVariants ? distinctVariantColors(skuVariants) : [];
  const skuSizeOptions = hasSkuVariants ? distinctVariantSizes(skuVariants, skuColor) : [];
  const stockBlocked = displayStock <= 0;
  const maxOrderQty = Math.max(1, Math.min(99, displayStock > 0 ? displayStock : 99));
  useEffect(() => {
    setQty((q) => Math.max(1, Math.min(maxOrderQty, q)));
  }, [maxOrderQty]);
  const productImages = product.images ?? [];
  const displayGalleryImages = useMemo(() => {
    const base = productImages.length > 0 ? productImages : [];
    if (!hasSkuVariants) {
      return base.length > 0 ? base : [PLACEHOLDER_IMAGE];
    }
    const vUrls = (activeSkuVariant?.images ?? []).filter(Boolean);
    if (vUrls.length === 0) {
      return base.length > 0 ? base : [PLACEHOLDER_IMAGE];
    }
    const merged = [...vUrls, ...base.filter((u) => !vUrls.includes(u))];
    return merged.length > 0 ? merged : [PLACEHOLDER_IMAGE];
  }, [hasSkuVariants, activeSkuVariant, productImages]);

  useEffect(() => {
    if (!hasSkuVariants) return;
    setActiveImage(0);
  }, [hasSkuVariants, skuColor, skuSize, product.id]);

  const images = displayGalleryImages;
  const displayBrand = specifications.find((s) => s?.label?.toLowerCase() === "brand")?.value ?? brand;
  const keyFeatures = specifications.filter((s) => s?.label?.toLowerCase() !== "brand").slice(0, 6);
  const rating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryStr = deliveryDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: subCategoryName, href: `/category/${subCategorySlug}` },
    { label: displayBrand, href: `/category/${subCategorySlug}` },
    { label: product.name, href: undefined as undefined },
  ];


  const handleAddToCart = async () => {
    if (deliveryEligible === false) {
      toast.error("This item is not deliverable to your PIN. Change delivery location or choose another seller.");
      openDeliveryModal();
      return;
    }
    if (displayStock <= 0) {
      toast.error("This option is out of stock.");
      return;
    }
    setCartError(null);
    setAddingToCart(true);
    try {
      let variantKey: string | null = null;
      if (hasSkuVariants) {
        variantKey = buildSkuVariantKey(skuColor, skuSize);
        if (!findSkuVariantByKey(skuVariants, variantKey)) {
          toast.error("Choose a valid color and size.");
          setAddingToCart(false);
          return;
        }
      } else {
        const parts: string[] = [];
        if (colorVariation && selectedColor) parts.push(`Color:${selectedColor}`);
        if (storageVariation && selectedStorage) parts.push(`Storage:${selectedStorage}`);
        variantKey = parts.length > 0 ? parts.join("|") : null;
      }
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity: qty,
          variantKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error?.message ?? "Could not add to cart. Please try again.";
        if (res.status === 401 || res.status === 403) {
          addToGuestCart({
            productId: product.id,
            quantity: qty,
            variantKey,
            name: product.name,
            price,
            imageUrl: activeSkuVariant?.images?.[0] ?? activeSkuVariant?.image ?? product.images?.[0] ?? null,
            mrp: product.mrp,
          });
          toast.success("Added to cart");
          openCartDrawer();
          return;
        }
        toast.error(message);
        setCartError(message);
        return;
      }
      toast.success("Added to cart");
      dispatchCartUpdated();
      openCartDrawer();
    } catch {
      toast.error("Could not add to cart. Please try again.");
      setCartError("Could not add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (deliveryEligible === false) {
      toast.error("This item is not deliverable to your PIN. Change delivery location or choose another seller.");
      openDeliveryModal();
      return;
    }
    if (displayStock <= 0) {
      toast.error("This option is out of stock.");
      return;
    }
    setCartError(null);
    setBuyNowLoading(true);
    try {
      let variantKey: string | null = null;
      if (hasSkuVariants) {
        variantKey = buildSkuVariantKey(skuColor, skuSize);
        if (!findSkuVariantByKey(skuVariants, variantKey)) {
          toast.error("Choose a valid color and size.");
          setBuyNowLoading(false);
          return;
        }
      } else {
        const parts: string[] = [];
        if (colorVariation && selectedColor) parts.push(`Color:${selectedColor}`);
        if (storageVariation && selectedStorage) parts.push(`Storage:${selectedStorage}`);
        variantKey = parts.length > 0 ? parts.join("|") : null;
      }
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity: qty,
          variantKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error?.message ?? "Could not add to cart. Please try again.";
        if (res.status === 401 || res.status === 403) {
          addToGuestCart({
            productId: product.id,
            quantity: qty,
            variantKey,
            name: product.name,
            price,
            imageUrl: activeSkuVariant?.images?.[0] ?? activeSkuVariant?.image ?? product.images?.[0] ?? null,
            mrp: product.mrp,
          });
          toast.success("Added to cart. Sign in to checkout.");
          router.push("/login?returnUrl=" + encodeURIComponent("/checkout"));
          return;
        }
        toast.error(message);
        setCartError(message);
        return;
      }
      toast.success("Added to cart");
      dispatchCartUpdated();
      router.push("/checkout");
    } catch {
      toast.error("Could not add to cart. Please try again.");
      setCartError("Could not add to cart. Please try again.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  const buyBoxCard = (
    <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "20px",
                  background: "#FFFFFF",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Price */}
                <div>
                  <p
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 800,
                      fontSize: 26,
                      color: "#FF6A00",
                      margin: 0,
                    }}
                  >
                    ₹{price.toLocaleString("en-IN")}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12,
                      color: "#9CA3AF",
                      margin: "2px 0 0",
                      textDecoration: "line-through",
                    }}
                  >
                    M.R.P ₹{mrp.toLocaleString("en-IN")}
                  </p>
                </div>
    
                {/* Delivery */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Truck size={14} color="#16A34A" />
                    <span
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 13,
                        color: "#16A34A",
                        fontWeight: 600,
                      }}
                    >
                      FREE Delivery
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12,
                      color: "#374151",
                      margin: 0,
                    }}
                  >
                    Get it by{" "}
                    <span style={{ fontWeight: 700, color: "#111827" }}>{deliveryStr}</span>
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 11,
                        color: "#6B7280",
                      }}
                    >
                      Order from:
                    </span>
                    <span
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 11,
                        color: "#374151",
                        fontWeight: 600,
                      }}
                    >
                      Google Pay / PhonePe
                    </span>
                  </div>
                </div>
    
                {/* In Stock */}
                <div
                  style={{
                    background: "#F0FDF4",
                    borderRadius: 6,
                    padding: "6px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={14} color="#16A34A" />
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#16A34A",
                    }}
                  >
                    In Stock
                  </span>
                </div>
    
                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 13,
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    Qty:
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #D1D5DC",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      style={{
                        width: 32,
                        height: 32,
                        background: "#F9FAFB",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={12} color="#374151" />
                    </button>
                    <span
                      style={{
                        width: 36,
                        textAlign: "center",
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxOrderQty, q + 1))}
                      style={{
                        width: 32,
                        height: 32,
                        background: "#F9FAFB",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={12} color="#374151" />
                    </button>
                  </div>
                </div>
    
                {cartError && (
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: "#DC2626", margin: "0 0 8px" }}>
                    {cartError}
                  </p>
                )}
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart || deliveryEligible === false || stockBlocked}
                  style={{
                    width: "100%",
                    height: 44,
                    background:
                      addingToCart || deliveryEligible === false || stockBlocked ? "#CC5500" : "#FF6A00",
                    border: "none",
                    borderRadius: 10,
                    cursor: addingToCart || deliveryEligible === false || stockBlocked ? "not-allowed" : "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#FFFFFF",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!addingToCart && deliveryEligible !== false)
                      (e.currentTarget as HTMLButtonElement).style.background = "#E55F00";
                  }}
                  onMouseLeave={(e) => {
                    if (!addingToCart && deliveryEligible !== false)
                      (e.currentTarget as HTMLButtonElement).style.background = "#FF6A00";
                  }}
                >
                  {addingToCart
                    ? "Adding…"
                    : deliveryEligible === false
                      ? "Not deliverable here"
                      : stockBlocked
                        ? "Out of stock"
                        : "Add to Cart"}
                </button>
    
                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={buyNowLoading || deliveryEligible === false || stockBlocked}
                  style={{
                    width: "100%",
                    height: 44,
                    background: "#FFF0E0",
                    border: "2px solid #FF6A00",
                    borderRadius: 10,
                    cursor: buyNowLoading || deliveryEligible === false || stockBlocked ? "not-allowed" : "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#FF6A00",
                    transition: "background 0.15s",
                    opacity: buyNowLoading || deliveryEligible === false || stockBlocked ? 0.65 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!buyNowLoading && deliveryEligible !== false)
                      (e.currentTarget as HTMLButtonElement).style.background = "#FFE0C0";
                  }}
                  onMouseLeave={(e) => {
                    if (!buyNowLoading && deliveryEligible !== false)
                      (e.currentTarget as HTMLButtonElement).style.background = "#FFF0E0";
                  }}
                >
                  {buyNowLoading
                    ? "Adding…"
                    : deliveryEligible === false
                      ? "Not deliverable here"
                      : stockBlocked
                        ? "Out of stock"
                        : "Buy Now"}
                </button>
    
                {/* Wishlist */}
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  style={{
                    width: "100%",
                    height: 36,
                    background: "none",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "border-color 0.15s",
                  }}
                >
                  <Heart
                    size={14}
                    fill={wishlisted ? "#FF4D4D" : "none"}
                    color={wishlisted ? "#FF4D4D" : "#6B7280"}
                  />
                  {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
    
                {/* Divider */}
                <div style={{ borderTop: "1px solid #E5E7EB" }} />
    
                {/* Trust badges */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { Icon: ShieldCheck, color: "#16A34A", text: "100% Secure Checkout" },
                    { Icon: RotateCcw, color: "#2563EB", text: "7 Day Easy Returns" },
                    { Icon: Award, color: "#7C3AED", text: "1 Year Warranty" },
                  ].map(({ Icon, color, text }) => (
                    <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} color={color} />
                      <span
                        style={{
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 12,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
  );

  return (
    <div
      className="w-full min-h-screen pb-[calc(9rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
      style={{ background: "#FFFFFF", fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar showBackButton backFallbackHref={`/category/${subCategorySlug}`} />

      {/* Breadcrumb — desktop only; hidden on mobile to save vertical space */}
      <div
        className="hidden lg:block"
        style={{
          background: "#F9FAFB",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-baseline gap-x-1 gap-y-1 px-3 py-2 sm:px-4 lg:px-10">
          {breadcrumbs.map((crumb, i, arr) => (
            <div key={i} className="flex min-w-0 max-w-full items-baseline gap-1">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="shrink-0"
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 12,
                    color: "#FF6A00",
                    fontWeight: 400,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="min-w-0 break-words"
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 12,
                    color: "#374151",
                    fontWeight: 500,
                  }}
                >
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && <ChevronRight size={12} color="#9CA3AF" className="shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main product area ─────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-3 py-4 sm:px-4 lg:flex-row lg:gap-8 lg:px-10 lg:py-7">
        {/* ── LEFT: Image Gallery ─────────────────────────────────── */}
        <div
          className="mx-auto w-full max-w-[420px] shrink-0 lg:mx-0"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Main image */}
          <div
            className="relative aspect-square w-full lg:aspect-auto lg:h-[420px]"
            style={{
              background: "#F3F4F6",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
            }}
          >
            <img
              src={images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {discount > 0 && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: "#16A34A",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#FFFFFF",
                }}
              >
                {discount}% OFF
              </span>
            </div>
            )}
            {/* Wishlist */}
            <button
              onClick={() => setWishlisted((w) => !w)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                background: "#FFFFFF",
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Heart
                size={16}
                fill={wishlisted ? "#FF4D4D" : "none"}
                color={wishlisted ? "#FF4D4D" : "#6B7280"}
              />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:gap-2.5 sm:overflow-visible [&::-webkit-scrollbar]:h-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                type="button"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: i === activeImage ? "2px solid #FF6A00" : "2px solid #E5E7EB",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                  background: "#F3F4F6",
                  transition: "border-color 0.15s",
                }}
                className="sm:h-[72px] sm:w-[72px]"
              >
                <img
                  src={img}
                  alt={`View ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── MIDDLE: Product Details ─────────────────────────────── */}
        <div className="min-w-0 flex-1" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Brand */}
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 13,
              color: "#FF6A00",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {displayBrand}
          </p>

          {/* Title (from API: product.name) */}
          <h1
            className="text-lg leading-snug text-[#111827] sm:text-xl sm:leading-8 lg:text-[22px] lg:leading-[30px]"
            style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, margin: 0 }}
          >
            {product.name}
          </h1>

          {/* Rating (from API: product.avgRating, product.reviewCount) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StarRow rating={rating} count={reviewCount} />
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 13,
                color: "#9CA3AF",
              }}
            >
              |
            </span>
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              M.R.P: ₹{mrp.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Price block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                className="text-2xl sm:text-3xl lg:text-[30px]"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 800,
                  color: "#FF6A00",
                }}
              >
                ₹{price.toLocaleString("en-IN")}
              </span>
              {discount > 0 && (
              <div
                style={{
                  background: "#DCFCE7",
                  borderRadius: 6,
                  padding: "3px 10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#16A34A",
                  }}
                >
                  {discount}% OFF
                </span>
              </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  color: "#6B7280",
                }}
              >
                M.R.P:
              </span>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  color: "#9CA3AF",
                  textDecoration: "line-through",
                }}
              >
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="w-full lg:hidden">{buyBoxCard}</div>

          {/* Delivery info */}
          <div
            style={{
              background: "#F9FAFB",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* FREE Delivery */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  border: "1.5px solid #374151",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    color: "#374151",
                  }}
                >
                  FREE
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Delivery
              </span>
              <Truck size={15} color="#374151" />
            </div>

            {/* Delivery date */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={15} color="#16A34A" />
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                Get it by{" "}
                <span style={{ fontWeight: 700, color: "#111827" }}>{deliveryStr}</span>
              </span>
            </div>

            {/* Deliver to */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} color="#6B7280" />
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                Deliver to{" "}
                <span style={{ color: "#374151", fontWeight: 500 }}>{deliverToLabel}</span>
              </span>
              <button
                type="button"
                onClick={openDeliveryModal}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12,
                  color: "#FF6A00",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                Change
              </button>
            </div>

            {deliveryEligible === false && (
              <div
                role="alert"
                className="max-w-full"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                }}
              >
                <AlertTriangle size={18} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#92400E",
                      margin: "0 0 4px",
                    }}
                  >
                    Not deliverable to {location.pincode}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12,
                      color: "#78350F",
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    This seller does not ship to your PIN. Update your delivery location or browse products available in your area.
                  </p>
                  <button
                    type="button"
                    onClick={openDeliveryModal}
                    style={{
                      marginTop: 8,
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#B45309",
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Change delivery location
                  </button>
                </div>
              </div>
            )}

            {/* Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: displayStock > 0 ? "#16A34A" : "#DC2626",
                }}
              >
                {displayStock > 0 ? `● In stock (${displayStock} left)` : "● Out of stock"}
              </span>
            </div>
          </div>

          {/* Key Features */}
          {keyFeatures.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Key Features
            </p>
            <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
              {keyFeatures.map((feat, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    listStyle: "none",
                  }}
                >
                  <span
                    style={{
                      color: "#FF6A00",
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: "20px",
                      flexShrink: 0,
                    }}
                  >
                    •
                  </span>
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 13,
                      color: "#374151",
                      lineHeight: "20px",
                    }}
                  >
                    {feat.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* SKU variants: Color */}
          {hasSkuVariants && skuColorOptions.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Color:{" "}
              <span style={{ color: "#FF6A00", fontWeight: 700 }}>{skuColor ?? skuColorOptions[0]}</span>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {skuColorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSkuColor(c)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border:
                      skuColor === c ? "2px solid #FF6A00" : "1.5px solid #D1D5DC",
                    background: skuColor === c ? "#FFF4EC" : "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: skuColor === c ? 700 : 400,
                    fontSize: 13,
                    color: skuColor === c ? "#FF6A00" : "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Color (legacy attribute variations) */}
          {!hasSkuVariants && colorVariation && colorVariation.values.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Color:{" "}
              <span style={{ color: "#FF6A00", fontWeight: 700 }}>{selectedColor || colorVariation.values[0]}</span>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {colorVariation.values.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border:
                      selectedColor === c
                        ? "2px solid #FF6A00"
                        : "1.5px solid #D1D5DC",
                    background:
                      selectedColor === c ? "#FFF4EC" : "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: selectedColor === c ? 700 : 400,
                    fontSize: 13,
                    color: selectedColor === c ? "#FF6A00" : "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* SKU variants: Size */}
          {hasSkuVariants && skuSizeOptions.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Size:{" "}
              <span style={{ color: "#6B7280", fontWeight: 400 }}>{skuSize ?? skuSizeOptions[0]}</span>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {skuSizeOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkuSize(s)}
                  style={{
                    padding: "7px 20px",
                    borderRadius: 8,
                    border:
                      skuSize === s ? "2px solid #FF6A00" : "1.5px solid #D1D5DC",
                    background: skuSize === s ? "#FFF4EC" : "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: skuSize === s ? 700 : 400,
                    fontSize: 13,
                    color: skuSize === s ? "#FF6A00" : "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Storage (legacy) */}
          {!hasSkuVariants && storageVariation && storageVariation.values.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Storage:{" "}
              <span style={{ color: "#6B7280", fontWeight: 400 }}>{selectedStorage || storageVariation.values[0]}</span>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {storageVariation.values.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStorage(s)}
                  style={{
                    padding: "7px 20px",
                    borderRadius: 8,
                    border:
                      selectedStorage === s
                        ? "2px solid #FF6A00"
                        : "1.5px solid #D1D5DC",
                    background:
                      selectedStorage === s ? "#FFF4EC" : "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: selectedStorage === s ? 700 : 400,
                    fontSize: 13,
                    color: selectedStorage === s ? "#FF6A00" : "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* ── RIGHT: Buy Box (desktop) — ref used to toggle fixed purchase bar when this scrolls away ── */}
        <div
          ref={desktopPurchaseRef}
          className="hidden w-full shrink-0 self-start lg:sticky lg:top-4 lg:block lg:w-[280px]"
        >
          {buyBoxCard}
        </div>
      </div>

      {/* ── Product Description / Specs ───────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1360px] px-3 pb-8 sm:px-4 lg:px-10 lg:pb-10">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6 md:px-8 md:py-6">
          <h2
            className="mb-3 inline-block border-b-2 border-[#FF6A00] pb-2 text-base font-bold text-[#111827] sm:text-lg"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Product Description
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Left description */}
            <div>
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: "22px",
                }}
              >
                {product.description ||
                  `${product.name} – quality product with secure checkout and easy returns.`}
              </p>
            </div>

            {/* Right specs table */}
            <div className="min-w-0 overflow-x-auto">
              <table className="min-w-[280px] w-full" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  {(product.specifications ?? []).map((s, i) => (
                    <tr
                      key={s.label}
                      style={{
                        background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 13,
                          color: "#374151",
                          fontWeight: 600,
                          width: "40%",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        {s.label}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 13,
                          color: "#6B7280",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        {s.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Related products from stores */}
      <RelatedProductsSection
        title="Related products from stores"
        items={relatedFromStores}
      />

      {/* Product related to this item */}
      <RelatedProductsSection
        title="Product related to this item"
        items={relatedToItem}
      />

      {/* Sticky purchase bar: always on small screens; on lg+ appears when sidebar buy box scrolls out of view */}
      <div
        className={[
          "fixed inset-x-0 z-[110] border-t border-[#E5E7EB] bg-white/95 backdrop-blur-sm",
          "transition-[transform,opacity] duration-200 ease-out will-change-transform",
          /* on mobile: sit just above the 68px bottom nav */
          "max-lg:bottom-[calc(68px+env(safe-area-inset-bottom,0px))] max-lg:translate-y-0 max-lg:opacity-100",
          /* on desktop: sit at the very bottom edge */
          "lg:bottom-0",
          floatingPurchaseVisible
            ? "lg:translate-y-0 lg:opacity-100"
            : "lg:pointer-events-none lg:translate-y-full lg:opacity-0",
        ].join(" ")}
        style={{
          paddingBottom: 12,
          paddingTop: 12,
          paddingLeft: 12,
          paddingRight: 12,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {cartError && (
          <p
            className="mb-2 text-center text-xs text-red-600"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {cartError}
          </p>
        )}
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-[#D1D5DC]">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center bg-[#F9FAFB]"
              aria-label="Decrease quantity"
            >
              <Minus size={12} color="#374151" />
            </button>
            <span
              className="min-w-[2rem] text-center text-sm font-bold text-[#111827]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxOrderQty, q + 1))}
              className="flex h-9 w-9 items-center justify-center bg-[#F9FAFB]"
              aria-label="Increase quantity"
            >
              <Plus size={12} color="#374151" />
            </button>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || deliveryEligible === false || stockBlocked}
              className="h-10 rounded-lg bg-[#FF6A00] text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {addingToCart
                ? "…"
                : deliveryEligible === false
                  ? "N/A"
                  : stockBlocked
                    ? "Out"
                    : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={buyNowLoading || deliveryEligible === false || stockBlocked}
              className="h-10 rounded-lg border-2 border-[#FF6A00] bg-[#FFF0E0] text-xs font-bold text-[#FF6A00] disabled:cursor-not-allowed disabled:opacity-65 sm:text-sm"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {buyNowLoading
                ? "…"
                : deliveryEligible === false
                  ? "N/A"
                  : stockBlocked
                    ? "Out"
                    : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
