"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { MobileAppShell } from "../components/MobileAppShell";
import { GlassCard } from "../components/GlassCard";

export function HybridProductDetailPage() {
  const [qty, setQty] = useState(1);

  return (
    <MobileAppShell title="Product Details">
      <GlassCard className="p-3">
        <div className="aspect-square rounded-xl bg-slate-200" />
        <div className="mt-3">
          <h2 className="text-lg font-bold text-slate-900">Noise Cancelling Headphones</h2>
          <p className="mt-1 text-sm text-slate-500">Premium audio for daily use.</p>
          <p className="mt-2 text-xl font-extrabold text-orange-600">₹3,499</p>
        </div>
      </GlassCard>

      <GlassCard className="mt-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Quantity</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="rounded-lg border border-slate-200 p-2"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-sm font-bold">{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} className="rounded-lg border border-slate-200 p-2">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto flex w-full max-w-md gap-2 px-3">
        <button className="h-11 flex-1 rounded-xl border-2 border-orange-500 bg-white text-sm font-bold text-orange-600">
          Add to Cart
        </button>
        <button className="h-11 flex-1 rounded-xl bg-orange-500 text-sm font-bold text-white">Buy Now</button>
      </div>
    </MobileAppShell>
  );
}
