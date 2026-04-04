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
  Info,
  DollarSign,
  AlertCircle,
  Check,
  ArrowRight,
} from "lucide-react";
import * as React from "react";
import { authService } from "@/services/auth.service";
import { isVendorApproved } from "@/lib/vendor-onboarding";
import { VendorSidebarItem } from "./VendorSidebarItem";
import { vendorService } from "@/services/vendor.service";
import type { VendorNotificationItem, VendorNotificationType } from "@/services/types/vendor.types";

export type VendorLayoutProps = {
  children: React.ReactNode;
  vendorStatus?: string;
  businessName?: string | null;
  activePath?: string;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function notifIconAndColor(type: VendorNotificationType): { icon: React.ElementType; color: string } {
  switch (type) {
    case "ORDER":    return { icon: ShoppingBag, color: "text-blue-600 bg-blue-100" };
    case "PAYMENT":  return { icon: DollarSign,  color: "text-green-600 bg-green-100" };
    case "RETURN":   return { icon: Package,     color: "text-orange-600 bg-orange-100" };
    case "SELLER":   return { icon: AlertCircle, color: "text-purple-600 bg-purple-100" };
    case "SYSTEM":
    default:         return { icon: Info,        color: "text-blue-600 bg-blue-100" };
  }
}

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return ""; }
}

// ─── component ───────────────────────────────────────────────────────────────

export function VendorLayout({
  children,
  vendorStatus = "approved",
  businessName,
  activePath = "",
}: VendorLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<VendorNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const isActive = (path: string) => activePath === path;
  const approved = isVendorApproved(vendorStatus);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Fetch unread count on mount (quiet — no loading state shown in header)
  React.useEffect(() => {
    vendorService
      .getNotifications({ limit: 1, unreadOnly: true })
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => {});
  }, []);

  const openNotifDropdown = async () => {
    setNotifOpen((prev) => !prev);
    if (notifOpen) return; // already open — just close
    setNotifLoading(true);
    try {
      const res = await vendorService.getNotifications({ limit: 10 });
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      /* silent */
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkOneRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await vendorService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await vendorService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

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
    { name: "Dashboard",  path: "/vendor",               icon: LayoutDashboard, locked: false },
    { name: "Orders",     path: "/vendor/orders",         icon: ShoppingBag,     locked: !approved },
    { name: "Products",   path: "/vendor/products",       icon: Package,         locked: !approved },
    { name: "Earnings",   path: "/vendor/earnings",       icon: Wallet,          locked: !approved },
    { name: "Payouts",    path: "/vendor/payouts",        icon: CreditCard,      locked: !approved },
    { name: "Reports",    path: "/vendor/reports",        icon: FileText,        locked: !approved },
    { name: "Profile & KYC", path: "/vendor/profile",    icon: User,            locked: false },
    { name: "Support",    path: "/vendor/support",        icon: HelpCircle,      locked: false },
  ];

  const getStatusBadge = () => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      approved:             { label: "Approved",             color: "bg-emerald-500" },
      under_review:         { label: "Under review",         color: "bg-amber-500" },
      pending_verification: { label: "Pending verification", color: "bg-slate-500" },
      rejected:             { label: "Rejected",             color: "bg-rose-500" },
      on_hold:              { label: "On hold",              color: "bg-orange-500" },
      blocked:              { label: "Blocked",              color: "bg-red-600" },
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
            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifDropdown}
                className="relative p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[360px] max-h-[480px] flex flex-col bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-[200] overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#1E293B]" />
                      <span className="font-bold text-[#1E293B] text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto">
                    {notifLoading ? (
                      <div className="space-y-0">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse border-b border-[#F1F5F9]">
                            <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                            <div className="flex-1 space-y-2 pt-0.5">
                              <div className="h-3 w-1/2 rounded bg-slate-200" />
                              <div className="h-2.5 w-full rounded bg-slate-100" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="w-10 h-10 text-[#CBD5E1] mb-3" />
                        <p className="text-sm font-semibold text-[#475569]">No notifications yet</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">We'll let you know when something happens.</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const { icon: Icon, color } = notifIconAndColor(n.type);
                        return (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-[#F1F5F9] last:border-b-0 transition-colors ${
                              n.read ? "bg-white" : "bg-blue-50/40"
                            }`}
                          >
                            <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <p className={`text-xs font-semibold leading-snug ${n.read ? "text-[#64748B]" : "text-[#1E293B]"}`}>
                                  {n.title}
                                </p>
                                {!n.read && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                              </div>
                              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                              <div className="flex items-center justify-between mt-1 gap-2">
                                <span className="text-[10px] text-[#94A3B8]">{relativeTime(n.createdAt)}</span>
                                {!n.read && (
                                  <button
                                    onClick={(e) => handleMarkOneRead(n.id, e)}
                                    className="text-[10px] font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-[#E2E8F0] px-4 py-2.5 shrink-0">
                    <Link
                      href="/vendor/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                    >
                      View all notifications
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {businessName ? businessName.slice(0, 2).toUpperCase() : "V"}
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
                  <div className="border-t border-[#E2E8F0] my-2" />
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
