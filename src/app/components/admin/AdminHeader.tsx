"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, User } from "lucide-react";
import { Link } from "../Link";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

export type AdminHeaderProps = {
  /** Opens the mobile sidebar (admin layout only). */
  onMenuClick?: () => void;
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Admin");
  const [roleHint, setRoleHint] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    // UUIDs / hex strings that look like order IDs go to orders; everything else to sellers
    const isOrderLike = /^[0-9a-f-]{8,}$/i.test(q);
    const dest = isOrderLike
      ? `/admin/orders?search=${encodeURIComponent(q)}`
      : `/admin/sellers?search=${encodeURIComponent(q)}`;
    router.push(dest);
    setSearchQuery("");
    inputRef.current?.blur();
  };

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
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur-md shadow-sm sm:h-16 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex shrink-0 rounded-xl border border-slate-200/80 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        {/* Brand (desktop) */}
        <div className="hidden shrink-0 border-r border-slate-200/80 pr-4 md:block">
          <IndovyaparLogo fontSize={20} style={{ lineHeight: "24px" }} />
        </div>

        {/* Search */}
        <div className="min-w-0 flex-1 sm:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search orders, sellers, products..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          href="/admin/notifications"
          className="relative inline-flex rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </Link>

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
