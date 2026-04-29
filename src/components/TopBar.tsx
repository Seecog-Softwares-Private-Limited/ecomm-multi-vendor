"use client";

import { MapPin, Headphones, Package } from "lucide-react";
import Link from "next/link";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";

/* Inherits Manrope from root layout (next/font); avoid font-['Manrope'] — name may not match bundled font */
const topLinkClass =
  "font-medium text-[13px] text-gray-500 hover:text-gray-700 whitespace-nowrap transition";

const topLinkOnBrandClass =
  "font-medium text-[13px] text-emerald-100/90 hover:text-white whitespace-nowrap transition";

export type TopBarProps = {
  /** Dark strip above primary navbar (e.g. legal pages with solid header). */
  tone?: "default" | "onBrand";
};

export function TopBar({ tone = "default" }: TopBarProps) {
  const { deliverToLabel, openDeliveryModal } = useDeliveryLocation();
  const linkClass = tone === "onBrand" ? topLinkOnBrandClass : topLinkClass;
  const mutedIcon = tone === "onBrand" ? "text-emerald-200/80" : "text-gray-500";
  const deliverStrong = tone === "onBrand" ? "text-white" : "text-gray-700";

  return (
    <div
      className={`hidden h-9 w-full flex-row items-center justify-between px-4 sm:px-6 md:flex ${
        tone === "onBrand"
          ? "border-b border-white/10 bg-[#163B2C]"
          : "border-b border-gray-100 bg-white"
      }`}
    >
      {/* Left */}
      <div className="flex flex-row items-center gap-6">
        <button
          type="button"
          onClick={openDeliveryModal}
          className={`flex flex-row items-center gap-1.5 ${linkClass} text-left`}
          aria-haspopup="dialog"
        >
          <MapPin size={13} className={`${mutedIcon} shrink-0`} aria-hidden />
          <span>
            Deliver to <span className={`font-semibold ${deliverStrong}`}>{deliverToLabel}</span>
          </span>
        </button>
        <button type="button" className={`flex flex-row items-center gap-1.5 ${linkClass}`}>
          <Headphones size={13} className={`${mutedIcon} shrink-0`} />
          Customer Support
        </button>
      </div>

      {/* Right with separators */}
      <div
        className={`flex flex-row items-center gap-4 text-sm ${
          tone === "onBrand" ? "text-emerald-200/50" : "text-gray-400"
        }`}
      >
        <Link href="/vendor/register" className={linkClass}>
          Sell on Platform
        </Link>
        <span aria-hidden>|</span>
        <Link href="#" className={linkClass}>
          Download App
        </Link>
        <span aria-hidden>|</span>
        <Link href="/my-orders" className={`flex flex-row items-center gap-1.5 ${linkClass}`}>
          <Package size={13} className="shrink-0" />
          Track Order
        </Link>
      </div>
    </div>
  );
}
