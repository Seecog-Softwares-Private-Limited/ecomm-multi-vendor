"use client";

import Link from "next/link";
import { GlassCard } from "../components/GlassCard";
import { MobileAppShell } from "../components/MobileAppShell";

const orders = [
  { id: "ORD-1042", amount: "₹3,499", status: "Delivered" },
  { id: "ORD-1038", amount: "₹1,899", status: "Shipped" },
];

export function HybridMyOrdersPage() {
  return (
    <MobileAppShell title="My Orders" activeTab="Orders">
      <div className="space-y-3">
        {orders.map((o) => (
          <GlassCard key={o.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{o.id}</p>
                <p className="text-sm text-slate-500">{o.status}</p>
              </div>
              <p className="text-sm font-bold text-orange-600">{o.amount}</p>
            </div>
            <Link href={`/order-detail/${o.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600">
              View details
            </Link>
          </GlassCard>
        ))}
      </div>
    </MobileAppShell>
  );
}
