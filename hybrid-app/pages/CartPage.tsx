"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridCartPage() {
  return (
    <MobileAppShell title="Cart">
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <GlassCard key={i}>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-lg bg-slate-200" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Cart Item {i + 1}</p>
                <p className="text-xs text-slate-500">Qty: 1</p>
                <p className="text-sm font-bold text-orange-600">₹{(i + 1) * 1200}</p>
              </div>
            </div>
          </GlassCard>
        ))}
        <GlassCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-lg font-bold text-slate-900">₹2,400</p>
          </div>
          <button className="mt-3 h-10 w-full rounded-xl bg-orange-500 text-sm font-bold text-white">Proceed to Checkout</button>
        </GlassCard>
      </div>
    </MobileAppShell>
  );
}
