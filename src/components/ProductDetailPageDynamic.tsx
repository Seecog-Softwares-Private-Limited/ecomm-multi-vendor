"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export type ProductDetailPageDynamicProps = {
  product: ProductDetail;
  categoryName: string;
  subCategoryName: string;
  subCategorySlug: string;
  brand: string;
};

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            fill={s <= Math.round(rating) ? "#FBBF24" : "#E5E7EB"}
            color={s <= Math.round(rating) ? "#FBBF24" : "#E5E7EB"}
          />
        ))}
      </div>
      <span className="text-[13px] text-[#FF6A00] font-medium">{rating.toFixed(1)}</span>
      <span className="text-[13px] text-[#6B7280]">({count.toLocaleString()} ratings)</span>
    </div>
  );
}

export function ProductDetailPageDynamic({
  product,
  categoryName,
  subCategoryName,
  subCategorySlug,
  brand,
}: ProductDetailPageDynamicProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [qty, setQty] = useState(1);

  const price = product.price;
  const mrp = product.mrp;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const images = product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"];
  const rating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const brandSpec = product.specifications.find((s) => s.label.toLowerCase() === "brand");
  const displayBrand = brandSpec?.value ?? brand;
  const keyFeatures = product.specifications.filter((s) => s.label.toLowerCase() !== "brand").slice(0, 6);
  const colorVariation = product.variations.find((v) => v.name.toLowerCase() === "color");
  const storageVariation = product.variations.find((v) => v.name.toLowerCase() === "storage" || v.name.toLowerCase() === "storage capacity");
  const [selectedColor, setSelectedColor] = useState(colorVariation?.values[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState(storageVariation?.values[0] ?? "");

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: subCategoryName, href: `/category/${subCategorySlug}` },
    { label: displayBrand, href: `/category/${subCategorySlug}` },
    { label: product.name, href: undefined },
  ];

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryStr = deliveryDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="w-full min-h-screen bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <TopBar />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="mx-auto flex items-center gap-1 px-4 sm:px-6 py-2 max-w-[1360px]">
          {breadcrumbs.map((crumb, i, arr) => (
            <div key={i} className="flex items-center gap-1">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-xs text-[#FF6A00] hover:underline font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-xs text-[#374151] font-medium truncate max-w-[200px]">
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && <ChevronRight size={12} className="text-[#9CA3AF] shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main content: 3-column layout — Left: gallery | Middle: info | Right: purchase card */}
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-7 grid grid-cols-1 lg:grid-cols-[1fr_1fr_340px] xl:grid-cols-[420px_1fr_360px] gap-6 lg:gap-8">
        {/* Left: Image gallery */}
        <div className="w-full flex flex-col gap-3 lg:max-w-[420px]">
          <div className="relative w-full aspect-square max-h-[420px] bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-hidden">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-[#16A34A] rounded-md px-2.5 py-1">
                <span className="text-white font-bold text-[13px]">{discount}% OFF</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full border border-[#E5E7EB] flex items-center justify-center shadow-sm hover:bg-gray-50"
            >
              <Heart size={16} fill={wishlisted ? "#FF4D4D" : "none"} color={wishlisted ? "#FF4D4D" : "#6B7280"} />
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden border-2 bg-[#F3F4F6] ${
                  i === activeImage ? "border-[#FF6A00]" : "border-[#E5E7EB]"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Product info (brand, title, rating, price, delivery, features, color, storage) */}
        <div className="flex-1 min-w-0 flex flex-col gap-3.5">
          <p className="text-[13px] text-[#FF6A00] font-medium">{displayBrand}</p>
          <h1 className="font-bold text-[22px] leading-tight text-[#111827]">{product.name}</h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            <StarRow rating={rating} count={reviewCount} />
            {mrp > 0 && (
              <>
                <span className="text-[#9CA3AF]">|</span>
                <span className="text-[13px] text-[#6B7280]">M.R.P: ₹{mrp.toLocaleString("en-IN")}</span>
              </>
            )}
          </div>
          <div className="border-t border-[#E5E7EB]" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-[28px] sm:text-[30px] text-[#FF6A00]">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {discount > 0 && (
                <span className="bg-[#DCFCE7] text-[#16A34A] font-bold text-[13px] px-2.5 py-1 rounded-md">
                  {discount}% OFF
                </span>
              )}
            </div>
            {mrp > price && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#6B7280]">M.R.P:</span>
                <span className="text-[13px] text-[#9CA3AF] line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Delivery (middle column) */}
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="border border-[#374151] rounded px-1.5 py-0.5 text-[11px] font-bold text-[#374151]">FREE</span>
              <span className="text-[13px] font-medium text-[#374151]">Delivery</span>
              <Truck size={15} className="text-[#374151]" />
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-[#16A34A]" />
              <span className="text-[13px] text-[#374151]">
                Get it by <span className="font-bold text-[#111827]">{deliveryStr}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#6B7280]" />
              <span className="text-[12px] text-[#6B7280]">
                Deliver to <span className="text-[#374151] font-medium">Mumbai, 400001</span>
              </span>
              <span className="text-[12px] text-[#FF6A00] font-medium underline cursor-pointer">Change</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13px] text-[#16A34A]">• In Stock</span>
            </div>
          </div>

          {/* Key Features */}
          {keyFeatures.length > 0 && (
            <div>
              <p className="font-bold text-[14px] text-[#111827] mb-2">Key Features</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-1">
                {keyFeatures.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#FF6A00] font-bold text-[14px]">•</span>
                    <span className="text-[13px] text-[#374151] leading-5">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-[#E5E7EB]" />

          {/* Color */}
          {colorVariation && colorVariation.values.length > 0 && (
            <div>
              <p className="text-[14px] font-semibold text-[#111827] mb-2">
                Color: <span className="text-[#FF6A00] font-bold">{selectedColor || colorVariation.values[0]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colorVariation.values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedColor(v)}
                    className={`px-4 py-2 rounded-full border-2 text-[13px] font-medium transition ${
                      selectedColor === v
                        ? "border-[#FF6A00] bg-[#FFF4EC] text-[#FF6A00]"
                        : "border-[#D1D5DC] bg-white text-[#374151]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage */}
          {storageVariation && storageVariation.values.length > 0 && (
            <div>
              <p className="text-[14px] font-semibold text-[#111827] mb-2">
                Storage: <span className="text-[#6B7280] font-normal">{selectedStorage || storageVariation.values[0]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {storageVariation.values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedStorage(v)}
                    className={`px-5 py-2 rounded-lg border-2 text-[13px] font-medium transition ${
                      selectedStorage === v
                        ? "border-[#FF6A00] bg-[#FFF4EC] text-[#FF6A00]"
                        : "border-[#D1D5DC] bg-white text-[#374151]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Purchase card (price, delivery, qty, Add to Cart, Buy Now, wishlist, guarantees) */}
        <div className="lg:col-start-3 w-full lg:max-w-[360px] h-fit">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 flex flex-col gap-4 sticky top-4">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[22px] text-[#111827]">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp > price && (
                <span className="text-[13px] text-[#9CA3AF] line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5 text-[13px] text-[#374151]">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-[#374151]" />
                <span>FREE Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#16A34A]" />
                <span>Get it by {deliveryStr}. Order from Google Pay / PhonePe.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span className="font-medium text-[#16A34A]">In Stock</span>
              </div>
            </div>
            <div className="border-t border-[#E5E7EB]" />
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-medium text-[#374151]">Qty:</span>
              <div className="flex items-center border border-[#D1D5DC] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 bg-[#F9FAFB] flex items-center justify-center hover:bg-[#F3F4F6]"
                >
                  <Minus size={12} className="text-[#374151]" />
                </button>
                <span className="w-9 text-center font-bold text-[14px] text-[#111827]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-8 h-8 bg-[#F9FAFB] flex items-center justify-center hover:bg-[#F3F4F6]"
                >
                  <Plus size={12} className="text-[#374151]" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="w-full h-12 bg-[#FF6A00] text-white font-bold text-[15px] rounded-xl hover:bg-[#E55F00] transition"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="w-full h-12 bg-white border-2 border-[#FF6A00] text-[#FF6A00] font-bold text-[15px] rounded-xl hover:bg-[#FFF0E0] transition"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              className="w-full text-[13px] text-[#374151] font-medium flex items-center justify-center gap-1.5 py-2 hover:underline"
            >
              <Heart size={14} fill={wishlisted ? "#FF4D4D" : "none"} color={wishlisted ? "#FF4D4D" : "#6B7280"} />
              {wishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#16A34A] shrink-0" />
                <span className="text-[12px] font-medium text-[#374151]">100% Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-[#2563EB] shrink-0" />
                <span className="text-[12px] font-medium text-[#374151]">7 Day Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#7C3AED] shrink-0" />
                <span className="text-[12px] font-medium text-[#374151]">1 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description — narrower content, two columns */}
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pb-10">
        <div className="mx-auto max-w-[1000px] border border-[#E5E7EB] rounded-xl p-6 sm:p-8 bg-white">
          <h2 className="font-bold text-[18px] text-[#111827] pb-3 mb-4 border-b-2 border-[#FF6A00] inline-block">
            Product Description
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <p className="text-[14px] text-[#374151] leading-[22px]">
                {product.description || `${product.name} – quality product with secure checkout and easy returns.`}
              </p>
              {product.description && (
                <p className="text-[14px] text-[#374151] leading-[22px] mt-3">
                  Powered by the latest technology, this device delivers performance and reliability with secure checkout and easy returns.
                </p>
              )}
            </div>
            <div>
              <table className="w-full border-collapse">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-[#F9FAFB]" : "bg-white"}>
                      <td className="py-2 px-3 text-[13px] font-semibold text-[#374151] w-[40%] border border-[#E5E7EB]">
                        {s.label}
                      </td>
                      <td className="py-2 px-3 text-[13px] text-[#6B7280] border border-[#E5E7EB]">
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
