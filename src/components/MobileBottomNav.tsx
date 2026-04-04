"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ClipboardList,
  ShoppingCart,
  Menu,
  Heart,
  User,
  LogIn,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { getGuestCartCount, subscribeToGuestCartChanges } from "@/lib/guest-cart";

const CART_UPDATED_EVENT = "indovyapar-cart-updated";

type TabItem = {
  key: string;
  href?: string;
  label: string;
  icon: LucideIcon;
  color: string;
  isActive: (pathname: string) => boolean;
};

const tabItems: TabItem[] = [
  {
    key: "home",
    href: "/",
    label: "Home",
    icon: Home,
    color: "#FF6A00",
    isActive: (pathname) => pathname === "/",
  },
  {
    key: "categories",
    href: "/browse-categories",
    label: "Categories",
    icon: LayoutGrid,
    color: "#2563EB",
    isActive: (pathname) =>
      pathname.startsWith("/browse-categories") || pathname.startsWith("/category"),
  },
  {
    key: "orders",
    href: "/my-orders",
    label: "Orders",
    icon: ClipboardList,
    color: "#7C3AED",
    isActive: (pathname) => pathname.startsWith("/my-orders") || pathname.startsWith("/order"),
  },
  {
    key: "cart",
    label: "Cart",
    icon: ShoppingCart,
    color: "#EA580C",
    isActive: () => false,
  },
];

/** Shown only when the customer is logged in. */
const accountQuickLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/my-orders", label: "Orders", icon: ClipboardList },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/my-orders", label: "Returns", icon: ClipboardList },
  { href: "/support-tickets", label: "Support", icon: LifeBuoy },
];

/** Links always visible to guests. */
const publicQuickLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCartDrawer } = useCartDrawer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (!res.ok) {
        setCartCount(0);
        return;
      }
      const json = await res.json().catch(() => ({}));
      const items = json?.data?.items ?? [];
      const total = Array.isArray(items)
        ? items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity ?? 1), 0)
        : 0;
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.data?.user && data.data.user.role === "CUSTOMER") {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    if (isLoggedIn === true) {
      fetchCartCount();
    } else if (isLoggedIn === false) {
      setCartCount(getGuestCartCount());
    }
  }, [isLoggedIn, fetchCartCount]);

  useEffect(() => {
    if (isLoggedIn !== false) return;
    const unsub = subscribeToGuestCartChanges(() => setCartCount(getGuestCartCount()));
    return unsub;
  }, [isLoggedIn]);

  useEffect(() => {
    const onCartUpdated = () => {
      if (isLoggedIn === true) fetchCartCount();
      if (isLoggedIn === false) setCartCount(getGuestCartCount());
    };
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
  }, [isLoggedIn, fetchCartCount]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoggedIn === true) fetchCartCount();
      if (document.visibilityState === "visible" && isLoggedIn === false) setCartCount(getGuestCartCount());
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [fetchCartCount, isLoggedIn]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setIsLoggedIn(false);
      router.push("/");
    }
  };

  const guestOrLoading = isLoggedIn !== true;

  const visibleTabs = useMemo(
    () => (guestOrLoading ? tabItems.filter((t) => t.key !== "orders") : tabItems),
    [guestOrLoading]
  );

  const visibleMenuLinks = useMemo(
    () => (guestOrLoading ? publicQuickLinks : [...accountQuickLinks, ...publicQuickLinks]),
    [guestOrLoading]
  );

  const menuActive =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    (!guestOrLoading && pathname.startsWith("/support-tickets")) ||
    (!guestOrLoading && pathname.startsWith("/wishlist")) ||
    (!guestOrLoading && pathname.startsWith("/profile"));

  const renderTab = (item: TabItem) => {
    const active = item.isActive(pathname);
    const color = item.color;
    const TabIcon = item.icon;

    if (item.key === "cart") {
      return (
        <button
          key={item.key}
          type="button"
          onClick={() => openCartDrawer()}
          className={`relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition ${
            active ? "bg-white/80 shadow-sm" : ""
          }`}
          style={{ color: "#6B7280" }}
          aria-label="Open cart"
        >
          <span className="relative">
            <ShoppingCart size={20} color={color} opacity={0.72} />
            {cartCount > 0 && (
              <span
                className="absolute flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                style={{ top: -6, right: -8 }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </span>
          <span className="text-[11px] font-medium">{item.label}</span>
        </button>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href!}
        className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition ${
          active ? "bg-white/80 shadow-sm" : ""
        }`}
        style={{ color: active ? color : "#6B7280" }}
      >
        <TabIcon size={20} color={color} opacity={active ? 1 : 0.72} />
        <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
      </Link>
    );
  };

  const shell = (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/60 bg-white/80 backdrop-blur-xl md:hidden"
        style={{
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -12px 30px rgba(15, 23, 42, 0.12)",
        }}
        aria-label="Mobile bottom navigation"
      >
        <div className="mx-auto flex h-[68px] max-w-[560px] items-center justify-around px-2">
          {visibleTabs.map(renderTab)}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition ${
              menuOpen || menuActive ? "bg-white/80 shadow-sm" : ""
            }`}
            style={{ color: menuOpen || menuActive ? "#0F172A" : "#6B7280" }}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-label="More menu"
          >
            <Menu size={20} color={menuOpen || menuActive ? "#0F172A" : "#0F172A"} opacity={menuOpen || menuActive ? 1 : 0.72} />
            <span className={`text-[11px] ${menuOpen || menuActive ? "font-semibold" : "font-medium"}`}>More</span>
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-[110] md:hidden" role="dialog" aria-modal="true" aria-label="More options">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[min(78vh,520px)] overflow-y-auto rounded-t-3xl border border-white/70 bg-white/95 shadow-[0_-20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl"
            style={{
              paddingBottom: "max(20px, calc(68px + env(safe-area-inset-bottom, 0px)))",
              paddingTop: 12,
            }}
          >
            <div className="mx-auto flex w-full max-w-[560px] flex-col px-4 pb-2">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" aria-hidden />
              {visibleMenuLinks.length > 0 && (
                <>
                  <p
                    className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Quick links
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {visibleMenuLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={`${href}-${label}`}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm transition active:scale-[0.99] hover:border-[#FF6A00]/40 hover:bg-[#FFF5EF]"
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ background: "linear-gradient(135deg, #FFF5EF 0%, #FFE4CC 100%)" }}
                        >
                          <Icon size={20} color="#FF6A00" />
                        </span>
                        <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                {isLoggedIn === true ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700 transition active:scale-[0.99]"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  >
                    <LogOut size={22} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl bg-[#FF6A00] px-4 py-3.5 text-white shadow-md transition active:scale-[0.99]"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  >
                    <LogIn size={22} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  if (!portalEl) return null;

  return createPortal(shell, portalEl);
}
