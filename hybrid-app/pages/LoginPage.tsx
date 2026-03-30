"use client";

import { MobileAppShell } from "../components/MobileAppShell";
import { GlassCard } from "../components/GlassCard";

export function HybridLoginPage() {
  return (
    <MobileAppShell title="Sign in" activeTab="Account">
      <GlassCard>
        <h2 className="text-lg font-bold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-600">Login with your account credentials.</p>
        <form className="mt-4 space-y-3">
          <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" placeholder="Email" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            type="password"
            placeholder="Password"
          />
          <button type="button" className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white">
            Login
          </button>
        </form>
      </GlassCard>
    </MobileAppShell>
  );
}
