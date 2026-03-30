"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridProfilePage() {
  return (
    <MobileAppShell title="My Profile" activeTab="Account">
      <GlassCard>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-emerald-700 text-2xl font-bold text-white">
            PA
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-slate-900">Pankaj Kumar</h2>
            <p className="truncate text-sm text-slate-600">pankaj@example.com</p>
          </div>
        </div>
      </GlassCard>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500">Orders</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">4</p>
          <p className="text-xs text-slate-500">Wishlist</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">3</p>
          <p className="text-xs text-slate-500">Addresses</p>
        </GlassCard>
      </div>
    </MobileAppShell>
  );
}
