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
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Sellers", path: "/admin/sellers" },
  { icon: FolderTree, label: "Categories", path: "/admin/categories" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
  { icon: RotateCcw, label: "Returns", path: "/admin/returns" },
  { icon: DollarSign, label: "Settlements", path: "/admin/settlements" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export type AdminSidebarProps = {
  activePath?: string;
};

export function AdminSidebar({ activePath = "" }: AdminSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-900 text-slate-200 shadow-xl">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/25">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight text-white">
            ADMIN PANEL
          </h1>
          <p className="text-xs text-slate-400 truncate">Market Hub</p>
        </div>
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
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-indigo-500/20 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }
              `}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-400" : ""}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
    </aside>
  );
}
