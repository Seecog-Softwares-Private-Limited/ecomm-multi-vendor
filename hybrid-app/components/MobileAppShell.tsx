"use client";

import Link from "next/link";
import { Home, Search, Package, Heart, User } from "lucide-react";
import * as React from "react";

type TabItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const tabs: TabItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/my-orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile", label: "Account", icon: User },
];

export type MobileAppShellProps = {
  title?: string;
  activeTab?: string;
  children: React.ReactNode;
};

export function MobileAppShell({ title = "Indovyapar", activeTab = "", children }: MobileAppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <Link href="/login" className="text-sm font-semibold text-orange-600">
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-3 pb-[84px] pt-3">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-1">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = activeTab === label;
            return (
              <Link
                key={label}
                href={href}
                className={`flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 ${
                  active ? "text-orange-600" : "text-slate-500"
                }`}
              >
                <Icon size={19} />
                <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
