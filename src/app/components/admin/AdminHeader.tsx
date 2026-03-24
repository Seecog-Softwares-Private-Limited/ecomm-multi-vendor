"use client";

import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { Link } from "../Link";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

export function AdminHeader() {
  const [displayName, setDisplayName] = useState("Admin");
  const [roleHint, setRoleHint] = useState("");

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const d = j?.success ? j.data : null;
        if (!d) return;
        const first = typeof d.firstName === "string" ? d.firstName : "";
        const last = typeof d.lastName === "string" ? d.lastName : "";
        const name = [first, last].filter(Boolean).join(" ").trim();
        if (name) setDisplayName(name);
        if (d.isSuperAdmin) setRoleHint("Super Admin");
        else if (d.role?.name) setRoleHint(String(d.role.name));
        else setRoleHint("Admin");
      })
      .catch(() => {});
  }, []);

  const profileClassName =
    "flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 transition-colors hover:border-slate-200 hover:bg-slate-100/80";

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md shadow-sm">
      {/* Brand (desktop) */}
      <div className="hidden md:block shrink-0 pr-4 border-r border-slate-200/80">
        <IndovyaparLogo fontSize={20} style={{ lineHeight: "24px" }} />
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, sellers, products..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        <Link href="/admin/settings" className={profileClassName}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white shadow-sm">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{displayName}</p>
            <p className="text-xs text-slate-500">{roleHint}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
