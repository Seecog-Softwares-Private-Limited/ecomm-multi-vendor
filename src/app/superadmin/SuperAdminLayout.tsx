"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  LogOut,
  Store,
  PackageCheck,
  Menu,
  X,
} from "lucide-react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.replace("/superadmin/login");
    }
  }, [mounted, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    router.replace("/superadmin/login");
  };

  if (!mounted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50/80"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="font-medium text-slate-600">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[min(18rem,100vw-2rem)] max-w-[18rem] flex-col border-r border-slate-800/50 bg-slate-900 text-slate-200 shadow-xl
          transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col gap-1 border-b border-slate-700/80 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <Link href="/superadmin" className="flex min-w-0 flex-1 items-center gap-2" onClick={() => setMobileNavOpen(false)}>
              <IndovyaparLogo variant="light" fontSize={22} style={{ lineHeight: "28px" }} />
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="pl-0.5 text-[11px] font-medium uppercase tracking-widest text-slate-500">Super Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 sm:px-3 sm:py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = (pathname ?? "").startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/15 text-white shadow-sm ring-1 ring-amber-400/20"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-700/80 p-2 sm:p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-500 to-emerald-600" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur-md shadow-sm sm:h-16 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex shrink-0 rounded-xl border border-slate-200/80 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">Super Admin</h1>
              <p className="hidden text-xs text-slate-500 sm:block">Roles, permissions, admins &amp; audit logs</p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-slate-700">
              Full access
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
