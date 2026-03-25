"use client";

import { Link } from "../Link";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  RotateCcw,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  FolderTree,
  MessageCircle,
  Lock,
  FileText,
  MapPin,
} from "lucide-react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import { useEffect, useState } from "react";

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  permission?: string;
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", permission: "dashboard" },
  { icon: Users, label: "Sellers", path: "/admin/sellers", permission: "sellers" },
  { icon: MapPin, label: "Website delivery", path: "/admin/delivery-areas", permission: "sellers" },
  { icon: FolderTree, label: "Categories", path: "/admin/categories", permission: "categories" },
  { icon: Package, label: "Products", path: "/admin/products", permission: "products" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders", permission: "orders" },
  { icon: RotateCcw, label: "Returns", path: "/admin/returns", permission: "returns" },
  { icon: DollarSign, label: "Settlements", path: "/admin/settlements", permission: "settlements" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", permission: "analytics" },
  { icon: MessageCircle, label: "Support Tickets", path: "/admin/support-tickets", permission: "support_tickets" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications", permission: "notifications" },
  { icon: Settings, label: "Settings", path: "/admin/settings", permission: "settings" },
  { icon: FileText, label: "CMS", path: "/admin/cms", permission: "cms" },
];

export type AdminSidebarProps = {
  activePath?: string;
};

export function AdminSidebar({ activePath = "" }: AdminSidebarProps) {
  const [permissions, setPermissions] = useState<Set<string> | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed"))))
      .then((json) => {
        const list = Array.isArray(json?.data?.permissions) ? json.data.permissions : [];
        setPermissions(new Set<string>(list));
      })
      .catch(() => setPermissions(new Set<string>()));
  }, []);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-900 text-slate-200 shadow-xl border-r border-slate-800/50">
      {/* Logo / Brand */}
      <div className="flex flex-col gap-1 px-5 py-5 border-b border-slate-700/80">
        <Link href="/admin" className="flex items-center gap-2 min-w-0">
          <IndovyaparLogo variant="light" fontSize={22} style={{ lineHeight: "28px" }} />
        </Link>
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500 pl-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/admin"
              ? activePath === "/admin"
              : activePath === item.path || activePath.startsWith(`${item.path}/`);
          const locked = item.permission ? (permissions ? !permissions.has(item.permission) : true) : false;

          return (
            <Link
              key={item.path}
              href={locked ? "#" : item.path}
              onClick={(e) => {
                if (!locked) return;
                e.preventDefault();
              }}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-amber-500/15 text-white shadow-sm ring-1 ring-amber-400/20"
                  : locked
                    ? "text-slate-500/70 cursor-not-allowed opacity-70"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }
              `}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-amber-400" : ""}`} />
              <span
                className="flex-1"
                title={locked ? "Locked by Super Admin permissions" : item.label}
              >
                {item.label}
              </span>
              {locked && <Lock className="h-4 w-4 text-slate-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-amber-500 to-emerald-600" />
    </aside>
  );
}
