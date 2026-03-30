"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridWishlistPage() {
  return (
    <MobileAppShell title="Wishlist" activeTab="Wishlist">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} className="p-3">
            <div className="mb-2 aspect-square rounded-xl bg-slate-200" />
            <p className="line-clamp-2 text-sm font-semibold text-slate-800">Wishlist Product {i + 1}</p>
            <p className="mt-1 text-sm font-bold text-orange-600">₹{(i + 1) * 799}</p>
          </GlassCard>
        ))}
      </div>
    </MobileAppShell>
  );
}
