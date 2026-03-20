import { MapPin, Headphones, Package } from "lucide-react";
import Link from "next/link";

const topLinkClass =
  "font-['Manrope'] font-medium text-[13px] text-gray-500 hover:text-gray-700 whitespace-nowrap transition";

export function TopBar() {
  return (
    <div className="hidden w-full flex-row justify-between items-center px-4 sm:px-6 h-9 bg-white border-b border-gray-100 md:flex">
      {/* Left */}
      <div className="flex flex-row items-center gap-6">
        <button className={`flex flex-row items-center gap-1.5 ${topLinkClass}`}>
          <MapPin size={13} className="text-gray-500 shrink-0" />
          Deliver to Mumbai
        </button>
        <button className={`flex flex-row items-center gap-1.5 ${topLinkClass}`}>
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
