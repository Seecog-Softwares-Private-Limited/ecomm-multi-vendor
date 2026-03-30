"use client";

import { MobileAppShell } from "../components/MobileAppShell";
import { GlassCard } from "../components/GlassCard";

export function HybridRegisterPage() {
  return (
    <MobileAppShell title="Create account" activeTab="Account">
      <GlassCard>
        <h2 className="text-lg font-bold text-slate-900">Join Indovyapar</h2>
        <p className="mt-1 text-sm text-slate-600">Create your account in a minute.</p>
        <form className="mt-4 space-y-3">
          <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Full name" />
          <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Email" />
          <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Phone" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            type="password"
            placeholder="Password"
          />
          <button type="button" className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white">
            Create Account
          </button>
        </form>
      </GlassCard>
    </MobileAppShell>
  );
}
