"use client";

import Link from "next/link";
import { MobileAppShell } from "../components/MobileAppShell";
import { GlassCard } from "../components/GlassCard";

const products = [
  { id: "p-1", name: "Wireless Earbuds", price: "₹1,999" },
  { id: "p-2", name: "Smart Watch Pro", price: "₹2,499" },
  { id: "p-3", name: "Gaming Mouse", price: "₹1,299" },
  { id: "p-4", name: "Bluetooth Speaker", price: "₹1,799" },
];

export function HybridHomePage() {
  return (
    <MobileAppShell title="Indovyapar" activeTab="Home">
      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Special offer</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Up to 60% off this week</h2>
        <p className="mt-1 text-sm text-slate-600">Premium picks curated for mobile shoppers.</p>
        <Link
          href="/category/electronics"
          className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Explore now
        </Link>
      </GlassCard>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`}>
            <GlassCard className="p-3">
              <div className="mb-2 aspect-square rounded-xl bg-slate-200" />
              <p className="line-clamp-2 text-sm font-semibold text-slate-800">{p.name}</p>
              <p className="mt-1 text-sm font-bold text-orange-600">{p.price}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </MobileAppShell>
  );
}
