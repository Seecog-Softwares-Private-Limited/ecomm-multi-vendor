"use client";

import * as React from "react";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader } from "../components/admin/AdminHeader";

export type AdminLayoutProps = {
  children: React.ReactNode;
  activePath?: string;
};

export function AdminLayout({ children, activePath = "" }: AdminLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      {/* Mobile: tap outside to close drawer */}
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <AdminSidebar
        activePath={activePath}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
