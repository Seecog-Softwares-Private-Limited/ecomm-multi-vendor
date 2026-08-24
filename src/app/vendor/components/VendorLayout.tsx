"use client";

import { usePathname, useRouter } from "next/navigation";
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
  ArrowRight,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE } from "@/lib/notifications/product-moderation";
import { isVendorApproved } from "@/lib/vendor-onboarding";
import { VendorSidebarItem } from "./VendorSidebarItem";
import { vendorService } from "@/services/vendor.service";
import type { VendorNotificationItem, VendorNotificationType } from "@/services/types/vendor.types";
import { useVendorAppNav } from "@/contexts/VendorAppNavContext";
import { postToNative } from "@/lib/native-bridge";
import {
  VENDOR_DASHBOARD_PATH,
  hasVendorHistoryOverlayState,
  isVendorDashboardPath,
  isVendorRootTabPath,
  isVendorStackedRoute,
} from "@/lib/vendor-app-navigation";

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

function formatFullDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export function VendorLayout({
  children,
  vendorStatus = "approved",
  businessName,
  activePath = "",
}: VendorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isHybridApp, navigateVendor } = useVendorAppNav();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<VendorNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [selectedNotif, setSelectedNotif] = React.useState<VendorNotificationItem | null>(null);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const profileHistRef = React.useRef(false);
  const notifHistDepthRef = React.useRef(0);
  const skipPopRef = React.useRef(false);

  const isActive = (path: string) => activePath === path;
  const approved = isVendorApproved(vendorStatus);

  const pushVendorHistory = React.useCallback((marker: string) => {
    window.history.pushState({ vendorUi: marker }, "");
  }, []);

  const goBackVendorHistory = React.useCallback((depth: number) => {
    if (depth <= 0) return;
    skipPopRef.current = true;
    window.history.go(-depth);
  }, []);

  const closeProfileMenu = React.useCallback((opts?: { fromPop?: boolean }) => {
    setProfileMenuOpen(false);
    if (!opts?.fromPop && profileHistRef.current) {
      profileHistRef.current = false;
      goBackVendorHistory(1);
    } else {
      profileHistRef.current = false;
    }
  }, [goBackVendorHistory]);

  /** Navigate from profile menu — buttons + router.push work reliably in Android WebView (Link taps often fail). */
  const navigateFromProfileMenu = React.useCallback(
    (path: string) => {
      profileHistRef.current = false;
      setProfileMenuOpen(false);
      navigateVendor(path);
    },
    [navigateVendor],
  );

  const overlayBlocksBackExit =
    profileMenuOpen || notifOpen || Boolean(selectedNotif);

  /** Native Android back — mirrors Amazon/Flipkart: stack within flow, dashboard = root, exit at root. */
  const handleHardwareBack = React.useCallback(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
      return;
    }

    if (overlayBlocksBackExit || hasVendorHistoryOverlayState()) {
      window.history.back();
      return;
    }

    const path = pathname ?? VENDOR_DASHBOARD_PATH;

    if (isVendorStackedRoute(path)) {
      router.back();
      return;
    }

    if (isVendorRootTabPath(path) && !isVendorDashboardPath(path)) {
      router.replace(VENDOR_DASHBOARD_PATH);
      return;
    }

    if (isVendorDashboardPath(path)) {
      postToNative({ type: "custom", name: "VENDOR_NAV_EXIT" });
      return;
    }

    router.back();
  }, [overlayBlocksBackExit, pathname, router, sidebarOpen]);

  React.useEffect(() => {
    if (!isHybridApp) {
      delete window.__INDOVYAPAR_VENDOR_HANDLE_BACK__;
      return;
    }
    window.__INDOVYAPAR_VENDOR_HANDLE_BACK__ = handleHardwareBack;
    return () => {
      delete window.__INDOVYAPAR_VENDOR_HANDLE_BACK__;
    };
  }, [handleHardwareBack, isHybridApp]);

  const closeNotifications = React.useCallback((opts?: { fromPop?: boolean }) => {
    const depth = notifHistDepthRef.current;
    setNotifOpen(false);
    setSelectedNotif(null);
    notifHistDepthRef.current = 0;
    if (!opts?.fromPop && depth > 0) {
      goBackVendorHistory(depth);
    }
  }, [goBackVendorHistory]);

  const backFromNotifDetail = React.useCallback((opts?: { fromPop?: boolean }) => {
    setSelectedNotif(null);
    if (!opts?.fromPop && notifHistDepthRef.current >= 2) {
      notifHistDepthRef.current = 1;
      goBackVendorHistory(1);
    } else {
      notifHistDepthRef.current = Math.max(0, notifHistDepthRef.current - 1);
    }
  }, [goBackVendorHistory]);

  /** Android / browser Back closes overlays before leaving the dashboard. */
  React.useEffect(() => {
    const onPopState = () => {
      if (skipPopRef.current) {
        skipPopRef.current = false;
        return;
      }
      if (selectedNotif) {
        backFromNotifDetail({ fromPop: true });
        return;
      }
      if (notifOpen) {
        closeNotifications({ fromPop: true });
        return;
      }
      if (profileMenuOpen || profileHistRef.current) {
        closeProfileMenu({ fromPop: true });
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [
    backFromNotifDetail,
    closeNotifications,
    closeProfileMenu,
    notifOpen,
    profileMenuOpen,
    selectedNotif,
  ]);

  React.useEffect(() => {
    if (profileMenuOpen && !profileHistRef.current) {
      pushVendorHistory("profile-menu");
      profileHistRef.current = true;
    }
  }, [profileMenuOpen, pushVendorHistory]);

  React.useEffect(() => {
    if (notifOpen && notifHistDepthRef.current === 0) {
      pushVendorHistory("notif-list");
      notifHistDepthRef.current = 1;
    } else if (!notifOpen) {
      notifHistDepthRef.current = 0;
    }
  }, [notifOpen, pushVendorHistory]);

  React.useEffect(() => {
    if (notifOpen && selectedNotif && notifHistDepthRef.current === 1) {
      pushVendorHistory("notif-detail");
      notifHistDepthRef.current = 2;
    }
  }, [notifOpen, selectedNotif, pushVendorHistory]);

  // Fetch unread count on mount (quiet — no loading state shown in header)
  React.useEffect(() => {
    vendorService
      .getNotifications({ limit: 1, unreadOnly: true })
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => {});
  }, []);

  /** Toast once per notification id when admin approves a product (session-scoped). */
  React.useEffect(() => {
    if (!approved || typeof window === "undefined") return;
    const storageKey = "vendor_product_approved_toast_ids";
    let cancelled = false;
    vendorService
      .getNotifications({ limit: 30, unreadOnly: true })
      .then((r) => {
        if (cancelled) return;
        let seen: string[] = [];
        try {
          seen = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]") as string[];
          if (!Array.isArray(seen)) seen = [];
        } catch {
          seen = [];
        }
        const seenSet = new Set(seen);
        let changed = false;
        for (const n of r.notifications) {
          if (n.title !== SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE || seenSet.has(n.id)) continue;
          toast.success("Your product was approved", {
            description: n.message,
            duration: 10_000,
            id: `vendor-product-approved-${n.id}`,
          });
          seenSet.add(n.id);
          changed = true;
        }
        if (changed) {
          const next = [...seenSet].slice(-100);
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [approved]);

  const openNotifDropdown = async () => {
    closeProfileMenu();
    if (notifOpen) {
      closeNotifications();
      return;
    }
    setNotifOpen(true);
    setSelectedNotif(null);
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

  const openNotifDetail = async (n: VendorNotificationItem) => {
    setSelectedNotif(n);
    if (n.read) return;
    try {
      await vendorService.markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
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
    { name: "Dashboard", path: "/vendor", icon: LayoutDashboard },
    { name: "Orders", path: "/vendor/orders", icon: ShoppingBag },
    { name: "Products", path: "/vendor/products", icon: Package },
    { name: "Earnings", path: "/vendor/earnings", icon: Wallet },
    { name: "Payouts", path: "/vendor/payouts", icon: CreditCard },
    { name: "Reports", path: "/vendor/reports", icon: FileText },
    { name: "Profile & KYC", path: "/vendor/profile?tab=business_info", icon: User },
    { name: "Support", path: "/vendor/support", icon: HelpCircle },
  ] as const;

  /** Mobile bottom bar — mirrors seller-app style primary destinations. */
  const bottomNavApproved: { name: string; path: string; icon: LucideIcon }[] = [
    { name: "Home", path: "/vendor", icon: LayoutDashboard },
    { name: "Orders", path: "/vendor/orders", icon: ShoppingBag },
    { name: "Products", path: "/vendor/products", icon: Package },
    { name: "Earnings", path: "/vendor/earnings", icon: Wallet },
    { name: "Payouts", path: "/vendor/payouts", icon: CreditCard },
  ];
  const bottomNavOnboarding: { name: string; path: string; icon: LucideIcon }[] = [
    { name: "Home", path: "/vendor", icon: LayoutDashboard },
    { name: "Profile", path: "/vendor/profile?tab=business_info", icon: User },
    { name: "Settings", path: "/vendor/settings", icon: Settings },
    { name: "Support", path: "/vendor/support", icon: HelpCircle },
  ];
  const bottomNavItems = approved ? bottomNavApproved : bottomNavOnboarding;

  function isBottomNavActive(path: string): boolean {
    const p = activePath.split("?")[0] ?? activePath;
    const normalized = p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
    if (path === "/vendor") return normalized === "/vendor";
    return normalized === path || normalized.startsWith(`${path}/`);
  }

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
    <div className="relative flex h-[100dvh] overflow-hidden bg-[#F8FAFC]">
      {profileMenuOpen ? (
        <div className="fixed inset-0 z-[150]" role="presentation">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={() => closeProfileMenu()}
          />
          <div
            role="menu"
            className="absolute right-3 top-[calc(env(safe-area-inset-top,0px)+3.75rem)] w-56 rounded-xl border border-[#E2E8F0] bg-white py-2 shadow-xl sm:right-4"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => navigateFromProfileMenu("/vendor/profile?tab=business_info")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B] touch-manipulation active:bg-[#F8FAFC]"
            >
              <User className="h-4 w-4 shrink-0" />
              <span className="font-medium">Profile</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => navigateFromProfileMenu("/vendor/settings")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B] touch-manipulation active:bg-[#F8FAFC]"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="font-medium">Settings</span>
            </button>
            <div className="my-2 border-t border-[#E2E8F0]" />
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#DC2626] transition-colors hover:bg-red-50 touch-manipulation active:bg-red-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      ) : null}
      {notifOpen ? (
        <div
          className="fixed inset-0 z-[120] flex flex-col bg-white pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
          role="dialog"
          aria-modal="true"
          aria-label={selectedNotif ? "Notification details" : "Notifications"}
        >
          {selectedNotif ? (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-[#E2E8F0] px-3 py-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => backFromNotifDetail()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                  aria-label="Back to notifications"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-[#1E293B] sm:text-base">
                  Message
                </h3>
                <button
                  type="button"
                  onClick={() => closeNotifications()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                {(() => {
                  const { icon: Icon, color } = notifIconAndColor(selectedNotif.type);
                  return (
                    <div className="mx-auto w-full max-w-lg space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold leading-snug text-[#1E293B]">
                            {selectedNotif.title}
                          </p>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            {formatFullDateTime(selectedNotif.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#334155]">
                          {selectedNotif.message}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E2E8F0] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Bell className="h-4 w-4 shrink-0 text-[#1E293B]" />
                  <span className="truncate text-sm font-bold text-[#1E293B] sm:text-base">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#3B82F6] transition-colors hover:bg-blue-50 hover:text-[#2563EB]"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => closeNotifications()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {notifLoading ? (
                  <div className="space-y-0">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex animate-pulse items-start gap-3 border-b border-[#F1F5F9] px-4 py-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2 pt-0.5">
                          <div className="h-3 w-1/2 rounded bg-slate-200" />
                          <div className="h-2.5 w-full rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <Bell className="mb-3 h-10 w-10 text-[#CBD5E1]" />
                    <p className="text-sm font-semibold text-[#475569]">No notifications yet</p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">We&apos;ll let you know when something happens.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const { icon: Icon, color } = notifIconAndColor(n.type);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => void openNotifDetail(n)}
                        className={`flex w-full items-start gap-3 border-b border-[#F1F5F9] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] ${
                          n.read ? "bg-white" : "bg-blue-50/40"
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`truncate text-sm font-semibold leading-snug ${n.read ? "text-[#64748B]" : "text-[#1E293B]"}`}>
                              {n.title}
                            </p>
                            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#64748B]">{n.message}</p>
                          <span className="mt-1 block text-[10px] text-[#94A3B8]">{relativeTime(n.createdAt)}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="shrink-0 border-t border-[#E2E8F0] px-4 py-2.5">
                <Link
                  href="/vendor/notifications"
                  onClick={() => closeNotifications()}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3B82F6] transition-colors hover:text-[#2563EB]"
                >
                  View all notifications
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(16rem,100vw-2rem)] max-w-[16rem] flex-col border-r border-[#E2E8F0] bg-white shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo + mobile business name */}
        <div className="shrink-0 border-b border-[#E2E8F0]">
          <div className="flex h-16 items-center justify-between px-6">
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
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <VendorSidebarItem
              key={item.name}
              icon={item.icon}
              label={item.name}
              route={item.path}
              active={isActive(item.path)}
              onSelect={() => setSidebarOpen(false)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E2E8F0] bg-white/95 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 sm:h-16 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-slate-50 hover:text-[#1E293B] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            {/* Business name + status (hide "Approved" on main screen — see Profile & KYC) */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h2 className="min-w-0 flex-1 truncate text-base font-bold leading-snug text-[#1E293B] sm:text-lg">
                {businessName ?? "Vendor"}
              </h2>
              {!approved && (
                <span className="shrink-0 scale-90 sm:scale-100">{getStatusBadge()}</span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            {/* ── Notification bell ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => void openNotifDropdown()}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (profileMenuOpen) {
                    closeProfileMenu();
                    return;
                  }
                  closeNotifications();
                  setProfileMenuOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F8FAFC] sm:gap-3 sm:px-3 sm:py-2"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white sm:h-10 sm:w-10">
                  {businessName ? businessName.slice(0, 2).toUpperCase() : "V"}
                </div>
                <ChevronDown className="hidden h-4 w-4 text-[#64748B] sm:block" />
              </button>

            </div>
          </div>
        </header>

        {/* Page Content — extra bottom padding on mobile for tab bar + safe area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6 sm:pb-6 lg:p-8 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2E8F0] bg-white/95 pb-[env(safe-area-inset-bottom,0px)] pt-1 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90 lg:hidden"
          aria-label="Primary"
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isBottomNavActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    navigateVendor(item.path);
                  }}
                  className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors touch-manipulation sm:text-[11px] ${
                    active ? "text-indigo-600" : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-indigo-600" : "text-[#94A3B8]"}`} />
                  <span className="max-w-full truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
