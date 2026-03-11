"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  Heart,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Minus,
  Plus,
} from "lucide-react";
import type { ProductDetail } from "@/types/catalog";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600";

export type ProductDetailPageProps = {
  product: ProductDetail;
  categoryName: string;
  subCategoryName: string;
  subCategorySlug: string;
  brand: string;
};

// ─── Star Rating Row (dynamic: rating and count from API) ─────────────────────
function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
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
}: ProductDetailPageProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const variations = product.variations ?? [];
  const specifications = product.specifications ?? [];
  const colorVariation = variations.find((v) => v?.name?.toLowerCase() === "color");
  const storageVariation = variations.find(
    (v) => v?.name?.toLowerCase() === "storage" || v?.name?.toLowerCase() === "storage capacity"
  );
  const [selectedColor, setSelectedColor] = useState(colorVariation?.values?.[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState(storageVariation?.values?.[0] ?? "");
  const [wishlisted, setWishlisted] = useState(false);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const price = Number(product.price) ?? 0;
  const mrp = Number(product.mrp) ?? 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const productImages = product.images ?? [];
  const images = productImages.length > 0 ? productImages : [PLACEHOLDER_IMAGE];
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
    setCartError(null);
    setAddingToCart(true);
    try {
      const parts: string[] = [];
      if (colorVariation && selectedColor) parts.push(`Color:${selectedColor}`);
      if (storageVariation && selectedStorage) parts.push(`Storage:${selectedStorage}`);
      const variantKey = parts.length > 0 ? parts.join("|") : null;
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
          toast.error("Please log in to add items to your cart.");
          const returnUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.pathname) : "";
          router.push(`/login?returnUrl=${returnUrl}`);
          return;
        }
        toast.error(message);
        setCartError(message);
        return;
      }
      toast.success("Added to cart");
      router.push("/cart");
    } catch {
      toast.error("Could not add to cart. Please try again.");
      setCartError("Could not add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "#FFFFFF", fontFamily: "'Manrope', sans-serif" }}
    >
      <TopBar />
      <Navbar />

      {/* Breadcrumb */}
      <div
        style={{
          background: "#F9FAFB",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div
          className="mx-auto flex items-center"
          style={{ maxWidth: 1360, padding: "8px 40px", gap: 4 }}
        >
          {breadcrumbs.map((crumb, i, arr) => (
            <div key={i} className="flex items-center" style={{ gap: 4 }}>
              {crumb.href ? (
                <Link
                  href={crumb.href}
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
              {i < arr.length - 1 && <ChevronRight size={12} color="#9CA3AF" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main product area ─────────────────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{ maxWidth: 1360, padding: "28px 40px", display: "flex", gap: 32 }}
      >
        {/* ── LEFT: Image Gallery ─────────────────────────────────── */}
        <div
          style={{
            width: 420,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Main image */}
          <div
            style={{
              width: "100%",
              height: 420,
              background: "#F3F4F6",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src={images[activeImage]}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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
          <div style={{ display: "flex", gap: 10 }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: i === activeImage ? "2px solid #FF6A00" : "2px solid #E5E7EB",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                  background: "#F3F4F6",
                  transition: "border-color 0.15s",
                }}
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
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
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
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#111827",
              margin: 0,
              lineHeight: "30px",
            }}
          >
            {product.name}
          </h1>

          {/* Rating (from API: product.avgRating, product.reviewCount) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 800,
                  fontSize: 30,
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
                <span style={{ color: "#374151", fontWeight: 500 }}>Mumbai, 400001</span>
              </span>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12,
                  color: "#FF6A00",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Change
              </span>
            </div>

            {/* In Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#16A34A",
                }}
              >
                ● In Stock
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

          {/* Color */}
          {colorVariation && colorVariation.values.length > 0 && (
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

          {/* Storage */}
          {storageVariation && storageVariation.values.length > 0 && (
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

        {/* ── RIGHT: Buy Box ──────────────────────────────────────── */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            alignSelf: "flex-start",
            position: "sticky",
            top: 16,
          }}
        >
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
                  onClick={() => setQty((q) => q + 1)}
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
              disabled={addingToCart}
              style={{
                width: "100%",
                height: 44,
                background: addingToCart ? "#CC5500" : "#FF6A00",
                border: "none",
                borderRadius: 10,
                cursor: addingToCart ? "wait" : "pointer",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#FFFFFF",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!addingToCart) (e.currentTarget as HTMLButtonElement).style.background = "#E55F00";
              }}
              onMouseLeave={(e) => {
                if (!addingToCart) (e.currentTarget as HTMLButtonElement).style.background = "#FF6A00";
              }}
            >
              {addingToCart ? "Adding…" : "Add to Cart"}
            </button>

            {/* Buy Now */}
            <button
              onClick={() => router.push("/checkout")}
              style={{
                width: "100%",
                height: 44,
                background: "#FFF0E0",
                border: "2px solid #FF6A00",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#FF6A00",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#FFE0C0")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#FFF0E0")
              }
            >
              Buy Now
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
        </div>
      </div>

      {/* ── Product Description / Specs ───────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{ maxWidth: 1360, padding: "0 40px 40px" }}
      >
        <div
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: "24px 32px",
            background: "#FFFFFF",
          }}
        >
          <h2
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#111827",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "2px solid #FF6A00",
              display: "inline-block",
            }}
          >
            Product Description
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginTop: 12,
            }}
          >
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
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
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

      <Footer />
    </div>
  );
}
