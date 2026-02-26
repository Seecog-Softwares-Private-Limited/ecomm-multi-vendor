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
  ShieldCheck
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
    <aside className="w-64 bg-white border-r-2 border-gray-400 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b-2 border-gray-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">ADMIN PANEL</h1>
            <p className="text-xs text-gray-600">MarketHub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 border-2 transition-colors ${
                isActive
                  ? "bg-gray-700 text-white border-gray-800"
                  : "text-gray-900 border-gray-400 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
