"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridOrderDetailPage() {
  return (
    <MobileAppShell title="Order Details" activeTab="Orders">
      <GlassCard>
        <p className="text-sm font-semibold text-slate-900">Order #ORD-1042</p>
        <p className="mt-1 text-xs text-slate-500">Placed on 26 Mar 2026</p>
        <p className="mt-2 text-sm font-semibold text-emerald-600">Status: Delivered</p>
      </GlassCard>
      <GlassCard className="mt-3">
        <p className="text-sm font-semibold text-slate-900">Items</p>
        <div className="mt-2 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between"><span>Wireless Earbuds</span><span>₹1,999</span></div>
          <div className="flex justify-between"><span>Charging Cable</span><span>₹499</span></div>
        </div>
      </GlassCard>
    </MobileAppShell>
  );
}
