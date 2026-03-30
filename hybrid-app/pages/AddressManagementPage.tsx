"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridAddressManagementPage() {
  return (
    <MobileAppShell title="Addresses">
      <div className="space-y-3">
        <GlassCard>
          <p className="text-sm font-semibold text-slate-900">Home</p>
          <p className="mt-1 text-sm text-slate-600">Pankaj Kumar, Mumbai 400001</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm font-semibold text-slate-900">Office</p>
          <p className="mt-1 text-sm text-slate-600">Andheri East, Mumbai 400093</p>
        </GlassCard>
      </div>
      <button className="mt-4 h-10 w-full rounded-xl border-2 border-orange-500 text-sm font-semibold text-orange-600">
        Add New Address
      </button>
    </MobileAppShell>
  );
}
