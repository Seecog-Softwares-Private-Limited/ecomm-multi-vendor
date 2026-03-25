"use client";

import { MapPin, Headphones, Package } from "lucide-react";
import Link from "next/link";
import { useDeliveryLocation } from "@/contexts/DeliveryLocationContext";

/* Inherits Manrope from root layout (next/font); avoid font-['Manrope'] — name may not match bundled font */
const topLinkClass =
  "font-medium text-[13px] text-gray-500 hover:text-gray-700 whitespace-nowrap transition";

export function TopBar() {
  const { deliverToLabel, openDeliveryModal } = useDeliveryLocation();

  return (
    <div className="hidden w-full flex-row justify-between items-center px-4 sm:px-6 h-9 bg-white border-b border-gray-100 md:flex">
      {/* Left */}
      <div className="flex flex-row items-center gap-6">
        <button
          type="button"
          onClick={openDeliveryModal}
          className={`flex flex-row items-center gap-1.5 ${topLinkClass} text-left`}
          aria-haspopup="dialog"
        >
          <MapPin size={13} className="text-gray-500 shrink-0" aria-hidden />
          <span>
            Deliver to <span className="text-gray-700 font-semibold">{deliverToLabel}</span>
          </span>
        </button>
        <button type="button" className={`flex flex-row items-center gap-1.5 ${topLinkClass}`}>
          <Headphones size={13} className="text-gray-500 shrink-0" />
          Customer Support
        </button>
      </div>

      {/* Right with separators */}
      <div className="flex flex-row items-center gap-4 text-gray-400 text-sm">
        <Link href="/vendor/register" className={topLinkClass}>
          Sell on Platform
        </Link>
        <span aria-hidden>|</span>
        <Link href="#" className={topLinkClass}>
          Download App
        </Link>
        <span aria-hidden>|</span>
        <Link href="/my-orders" className={`flex flex-row items-center gap-1.5 ${topLinkClass}`}>
          <Package size={13} className="shrink-0" />
          Track Order
        </Link>
      </div>
    </div>
  );
}
