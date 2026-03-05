"use client";

import { useRouter } from "next/navigation";
import { Link } from "../../components/Link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wallet,
  CreditCard,
  FileText,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import * as React from "react";
import { authService } from "@/services/auth.service";
import { isVendorApproved } from "@/lib/vendor-onboarding";
import { VendorSidebarItem } from "./VendorSidebarItem";

export type VendorLayoutProps = {
  children: React.ReactNode;
  vendorStatus?: string;
  businessName?: string | null;
  activePath?: string;
};

export function VendorLayout({
  children,
  vendorStatus = "approved",
  businessName,
  activePath = "",
}: VendorLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  const isActive = (path: string) => activePath === path;
  const approved = isVendorApproved(vendorStatus);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    try {
      await authService.logout();
      router.push("/vendor/login");
      router.refresh();
    } catch {
      router.push("/vendor/login");
      router.refresh();
    }
  };

  const navigation = [
    { name: "Dashboard", path: "/vendor", icon: LayoutDashboard, locked: false },
    { name: "Orders", path: "/vendor/orders", icon: ShoppingBag, locked: !approved },
    { name: "Products", path: "/vendor/products", icon: Package, locked: !approved },
    { name: "Earnings", path: "/vendor/earnings", icon: Wallet, locked: !approved },
    { name: "Payouts", path: "/vendor/payouts", icon: CreditCard, locked: !approved },
    { name: "Reports", path: "/vendor/reports", icon: FileText, locked: !approved },
    { name: "Profile & KYC", path: "/vendor/profile", icon: User, locked: false },
    { name: "Support", path: "/vendor/support", icon: HelpCircle, locked: false },
  ];

  const getStatusBadge = () => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      approved: { label: "Approved", color: "bg-emerald-500" },
      under_review: { label: "Under review", color: "bg-amber-500" },
      pending_verification: { label: "Pending verification", color: "bg-slate-500" },
      rejected: { label: "Rejected", color: "bg-rose-500" },
      on_hold: { label: "On hold", color: "bg-orange-500" },
      blocked: { label: "Blocked", color: "bg-red-600" },
    };
    const config = statusConfig[vendorStatus] ?? statusConfig.under_review;
    return (
      <span className={`${config.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0]">
          <Link href="/vendor" className="text-xl font-bold text-[#1E293B]">
            Indovypar
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#64748B] hover:text-[#1E293B]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navigation.map((item) => (
            <VendorSidebarItem
              key={item.name}
              icon={item.icon}
              label={item.name}
              route={item.path}
              disabled={item.locked}
              tooltip={item.locked ? "Complete Profile & KYC to unlock" : undefined}
              active={isActive(item.path)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#64748B] hover:text-[#1E293B]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1E293B]">{businessName ?? "Vendor"}</h2>
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  TS
                </div>
                <ChevronDown className="w-4 h-4 text-[#64748B]" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-2 z-50">
                  <Link
                    href="/vendor/profile"
                    className="flex items-center gap-3 px-4 py-3 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/vendor/settings"
                    className="flex items-center gap-3 px-4 py-3 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  <div className="border-t border-[#E2E8F0] my-2"></div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#DC2626] hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}
    </div>
  );
}