"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Shield, FileText, LogOut, Store, PackageCheck } from "lucide-react";
import { isAuthenticated, clearToken } from "@/lib/superadmin-api";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/superadmin" },
  { icon: Users, label: "Admins", path: "/superadmin/admins" },
  { icon: Shield, label: "Roles", path: "/superadmin/roles" },
  { icon: Store, label: "Vendor Approvals", path: "/superadmin/vendors" },
  { icon: PackageCheck, label: "Product Approvals", path: "/superadmin/products" },
  { icon: FileText, label: "Audit Logs", path: "/superadmin/audit-logs" },
];

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.replace("/superadmin/login");
    }
  }, [mounted, router]);

  const handleLogout = () => {
    clearToken();
    router.replace("/superadmin/login");
  };

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50/80"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="text-slate-600 font-medium">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50/80"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-900 text-slate-200 shadow-xl border-r border-slate-800/50">
        <div className="flex flex-col gap-1 px-5 py-5 border-b border-slate-700/80">
          <Link href="/superadmin" className="flex items-center gap-2 min-w-0">
            <IndovyaparLogo variant="light" fontSize={22} style={{ lineHeight: "28px" }} />
          </Link>
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 pl-0.5">
            Super Admin Panel
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = (pathname ?? "").startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/15 text-white shadow-sm ring-1 ring-amber-400/20"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-amber-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-700/80">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-500 to-emerald-600" />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md shadow-sm">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Super Admin</h1>
            <p className="text-xs text-slate-500">Roles, permissions, admins &amp; audit logs</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-slate-700">
              Full access
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
