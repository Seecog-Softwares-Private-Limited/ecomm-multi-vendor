"use client";

import { useState } from "react";
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

// ─── Product images ──────────────────────────────────────────────────────────
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1662561466246-296d8d096200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  "https://images.unsplash.com/photo-1631278919249-b985fdb1f901?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  "https://images.unsplash.com/photo-1764831138635-35873bdd671e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  "https://images.unsplash.com/photo-1600856209809-8419414d351f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  "https://images.unsplash.com/photo-1758186334264-d1ab8a079aa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
];

const KEY_FEATURES = [
  '6.8" Dynamic AMOLED 2X Display with 120Hz refresh rate',
  "200MP Pro-grade Camera with AI Zoom",
  "5000mAh Battery with latest Super Fast Charging",
  "Snapdragon Octa 8 Gen 3 Processor",
  "S Pen included with enhanced functionality",
  "Titanium Build with Gorilla Glass Armor",
];

const COLORS = [
  { name: "Titanium Gray", value: "#8A8D8F" },
  { name: "Titanium Black", value: "#1C1C1E" },
  { name: "Titanium Violet", value: "#7B5EA7" },
];

const STORAGES = ["256GB", "512GB", "1TB"];

// ─── Star Rating Row ──────────────────────────────────────────────────────────
function StarRow({ rating, count }: { rating: number; count: string }) {
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      <div className="flex items-center" style={{ gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            fill={s <= Math.round(rating) ? "#FBBF24" : "#E5E7EB"}
            color={s <= Math.round(rating) ? "#FBBF24" : "#E5E7EB"}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13,
          color: "#FF6A00",
          fontWeight: 500,
        }}
      >
        {rating}
      </span>
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13,
          color: "#6B7280",
        }}
      >
        | {count} ratings
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProductDetailPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Titanium Gray");
  const [selectedStorage, setSelectedStorage] = useState("256GB");
  const [wishlisted, setWishlisted] = useState(false);
  const [qty, setQty] = useState(1);

  const price = 129999;
  const mrp = 154900;
  const discount = Math.round(((mrp - price) / mrp) * 100);

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
          {["Home", "Mobile Phones", "Samsung", "Samsung Galaxy S24 Ultra 5G"].map(
            (crumb, i, arr) => (
              <div key={crumb} className="flex items-center" style={{ gap: 4 }}>
                <span
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 12,
                    color: i === arr.length - 1 ? "#374151" : "#FF6A00",
                    fontWeight: i === arr.length - 1 ? 500 : 400,
                    cursor: i < arr.length - 1 ? "pointer" : "default",
                    textDecoration: i < arr.length - 1 ? "underline" : "none",
                    textUnderlineOffset: 2,
                  }}
                >
                  {crumb}
                </span>
                {i < arr.length - 1 && <ChevronRight size={12} color="#9CA3AF" />}
              </div>
            )
          )}
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
              src={PRODUCT_IMAGES[activeImage]}
              alt="Samsung Galaxy S24 Ultra 5G"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Discount badge over image */}
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
            {PRODUCT_IMAGES.map((img, i) => (
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
            Samsung
          </p>

          {/* Title */}
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
            Samsung Galaxy S24 Ultra 5G
          </h1>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StarRow rating={4.7} count="1,534" />
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
                <span style={{ fontWeight: 700, color: "#111827" }}>Wednesday, March 13</span>
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
              {KEY_FEATURES.map((feat, i) => (
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
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Color */}
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
              <span style={{ color: "#FF6A00", fontWeight: 700 }}>{selectedColor}</span>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border:
                      selectedColor === c.name
                        ? "2px solid #FF6A00"
                        : "1.5px solid #D1D5DC",
                    background:
                      selectedColor === c.name ? "#FFF4EC" : "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: selectedColor === c.name ? 700 : 400,
                    fontSize: 13,
                    color: selectedColor === c.name ? "#FF6A00" : "#374151",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: c.value,
                      border: "1px solid rgba(0,0,0,0.15)",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Storage */}
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
              <span style={{ color: "#6B7280", fontWeight: 400 }}>{selectedStorage}</span>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {STORAGES.map((s) => (
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
                <span style={{ fontWeight: 700, color: "#111827" }}>Monday, March 10</span>
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

            {/* Add to Cart */}
            <button
              style={{
                width: "100%",
                height: 44,
                background: "#FF6A00",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#FFFFFF",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#E55F00")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#FF6A00")
              }
            >
              Add to Cart
            </button>

            {/* Buy Now */}
            <button
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
                The Samsung Galaxy S24 Ultra 5G redefines smartphone excellence with its titanium
                frame, revolutionary 200MP camera system, and the built-in S Pen. Experience
                AI-powered photography, a stunning AMOLED display, and all-day battery life in
                a device built to push boundaries.
              </p>
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: "22px",
                  marginTop: 12,
                }}
              >
                Powered by the Snapdragon 8 Gen 3 chipset, this device handles everything from
                gaming to professional workloads seamlessly. The S Pen is now embedded with even
                lower latency, making it the ultimate productivity companion.
              </p>
            </div>

            {/* Right specs table */}
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Display", '6.8" Dynamic AMOLED 2X, 3088×1440, 120Hz'],
                    ["Processor", "Snapdragon 8 Gen 3"],
                    ["RAM", "12GB"],
                    ["Storage", "256GB / 512GB / 1TB"],
                    ["Main Camera", "200MP + 12MP + 10MP + 10MP"],
                    ["Front Camera", "12MP"],
                    ["Battery", "5000mAh, 45W Fast Charge"],
                    ["OS", "Android 14 (One UI 6.1)"],
                    ["Weight", "232g"],
                    ["5G", "Yes"],
                  ].map(([label, value], i) => (
                    <tr
                      key={label}
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
                        {label}
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
                        {value}
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
