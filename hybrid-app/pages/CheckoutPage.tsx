"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridCheckoutPage() {
  return (
    <MobileAppShell title="Checkout">
      <GlassCard>
        <h3 className="text-base font-bold text-slate-900">Delivery Address</h3>
        <p className="mt-2 text-sm text-slate-600">221B Baker Street, Mumbai 400001</p>
      </GlassCard>
      <GlassCard className="mt-3">
        <h3 className="text-base font-bold text-slate-900">Payment Method</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2"><input type="radio" name="pay" defaultChecked /> UPI</label>
          <label className="flex items-center gap-2"><input type="radio" name="pay" /> Card</label>
          <label className="flex items-center gap-2"><input type="radio" name="pay" /> COD</label>
        </div>
      </GlassCard>
      <button className="mt-4 h-11 w-full rounded-xl bg-orange-500 text-sm font-bold text-white">Place Order</button>
    </MobileAppShell>
  );
}
