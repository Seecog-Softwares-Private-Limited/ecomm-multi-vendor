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
} from "lucide-react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Sellers", path: "/admin/sellers" },
  { icon: FolderTree, label: "Categories", path: "/admin/categories" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
  { icon: RotateCcw, label: "Returns", path: "/admin/returns" },
  { icon: DollarSign, label: "Settlements", path: "/admin/settlements" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: MessageCircle, label: "Support Tickets", path: "/admin/support-tickets" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export type AdminSidebarProps = {
  activePath?: string;
};

export function AdminSidebar({ activePath = "" }: AdminSidebarProps) {
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
          const isActive = activePath === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-amber-500/15 text-white shadow-sm ring-1 ring-amber-400/20"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }
              `}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-amber-400" : ""}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-amber-500 to-emerald-600" />
    </aside>
  );
}
