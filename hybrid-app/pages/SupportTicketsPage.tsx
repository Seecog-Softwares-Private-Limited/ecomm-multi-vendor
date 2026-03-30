"use client";

import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

export function HybridSupportTicketsPage() {
  return (
    <MobileAppShell title="Support">
      <div className="space-y-3">
        <GlassCard>
          <p className="text-sm font-semibold text-slate-900">Order delayed</p>
          <p className="mt-1 text-xs text-slate-500">#TKT-902 • Open</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm font-semibold text-slate-900">Return request help</p>
          <p className="mt-1 text-xs text-slate-500">#TKT-877 • Resolved</p>
        </GlassCard>
      </div>
      <button className="mt-4 h-10 w-full rounded-xl bg-orange-500 text-sm font-bold text-white">Create Ticket</button>
    </MobileAppShell>
  );
}
