"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, User, ShoppingCart, ChevronDown, LogIn, LogOut, ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IndovyaparLogo } from "./IndovyaparLogo";
import { getGuestCartCount, subscribeToGuestCartChanges } from "@/lib/guest-cart";
import { addRecentSearch } from "@/lib/search/search-history";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { useAppMode } from "@/contexts/AppModeContext";
import type { MenuTypeSlug } from "@/lib/catalog-constants";

type SearchScope =
  | { kind: "all" }
  | { kind: "menu"; slug: MenuTypeSlug; label: string }
  | { kind: "category"; slug: string; label: string };

const MENU_DEPARTMENTS: { slug: MenuTypeSlug; label: string }[] = [
  { slug: "deals", label: "Deals" },
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "best-sellers", label: "Best Sellers" },
];

function deptButtonLabel(scope: SearchScope): string {
  if (scope.kind === "all") return "All";
  const t = scope.label;
  return t.length > 12 ? `${t.slice(0, 11)}…` : t;
}

const ACCOUNT_DROPDOWN_LINKS = [
  { href: "/profile", label: "My Profile" },
  { href: "/my-orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/support-tickets", label: "Support" },
] as const;

const CART_UPDATED_EVENT = "indovyapar-cart-updated";

export type NavbarProps = {
  /** Show a back control (history back, or fallback href) — e.g. product detail */
  showBackButton?: boolean;
  /** When history has no usable back entry, navigate here */
  backFallbackHref?: string;
  /**
   * `solid` = filled primary bar (logo, search, account) like major marketplaces.
   * Default keeps the frosted glass header used on the home page.
   */
  surface?: "default" | "solid";
  /** Premium home layout: greeting, sticky search, mobile cart & notifications */
  homeLayout?: boolean;
};

function getGreeting(firstName?: string | null): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  if (firstName?.trim()) return `${time}, ${firstName.trim()}`;
  return time;
}

export function Navbar({
  showBackButton = false,
  backFallbackHref = "/",
  surface = "default",
  homeLayout = false,
}: NavbarProps) {
  const { isAppMode } = useAppMode();
  const [query, setQuery] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>({ kind: "all" });
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<{ slug: string; name: string }[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openCartDrawer } = useCartDrawer();

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
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoggedIn === true) fetchCartCount();
      if (document.visibilityState === "visible" && isLoggedIn === false) setCartCount(getGuestCartCount());
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [fetchCartCount, isLoggedIn]);

  useEffect(() => {
    const onCartUpdated = () => {
      if (isLoggedIn === true) fetchCartCount();
      if (isLoggedIn === false) setCartCount(getGuestCartCount());
    };
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
  }, [isLoggedIn, fetchCartCount]);

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
          setUserFirstName(data.data.user.firstName ?? null);
        } else {
          setIsLoggedIn(false);
          setUserFirstName(null);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUserFirstName(null);
      });
  }, []);

  useEffect(() => {
    if (!homeLayout || typeof window === "undefined") return;
    const onScroll = () => setHeaderScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [homeLayout]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        const d = j?.data;
        if (Array.isArray(d)) {
          setNavCategories(
            d.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(t)) {
        setAccountDropdownOpen(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(t)) {
        setDeptDropdownOpen(false);
      }
    };
    if (accountDropdownOpen || deptDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [accountDropdownOpen, deptDropdownOpen]);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    addRecentSearch(q);
    const params = new URLSearchParams({ q });
    if (searchScope.kind === "category") params.set("categorySlug", searchScope.slug);
    if (searchScope.kind === "menu") params.set("menuType", searchScope.slug);
    router.push(`/search?${params.toString()}`);
    setDeptDropdownOpen(false);
  };

  const handleLogout = async () => {
    setAccountDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setIsLoggedIn(false);
      router.push("/");
    }
  };

  const handleNavBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backFallbackHref || "/");
    }
  };

  const isSolid = surface === "solid";
  const greeting = getGreeting(userFirstName);

  if (isAppMode) return null;

  const mobileActions = (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:hidden">
      <Link
        href="/notifications"
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition hover:bg-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 md:h-11 md:w-11"
        aria-label="Notifications"
      >
        <Bell size={22} strokeWidth={2} />
      </Link>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition hover:bg-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
        onClick={openCartDrawer}
        aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Open cart"}
      >
        <ShoppingCart size={22} strokeWidth={2} />
        {cartCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div
      ref={accountDropdownRef}
      className={`${homeLayout ? "sticky top-0 z-[60]" : "relative z-[60]"} w-full px-3 py-2 sm:px-6 md:flex md:min-h-[70px] md:flex-row md:flex-wrap md:items-center md:justify-between md:py-0 ${
        isSolid
          ? "border-b border-white/15 bg-[#1E5128] shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "border-b border-white/60 backdrop-blur-xl"
      } ${homeLayout && headerScrolled ? "shadow-md" : ""}`}
      style={
        isSolid
          ? undefined
          : {
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 100%)",
            }
      }
    >
      {homeLayout && (
        <div
          className={`flex w-full items-center justify-between gap-3 pb-2 transition-all duration-300 md:hidden ${
            headerScrolled ? "pointer-events-none max-h-0 overflow-hidden opacity-0 pb-0" : "max-h-16 opacity-100"
          }`}
        >
          <p className="min-w-0 truncate text-sm font-semibold text-slate-800">{greeting}</p>
          {mobileActions}
        </div>
      )}

      <div className={`flex w-full flex-col md:flex-row md:items-center md:justify-between md:gap-4 ${homeLayout ? "md:flex-1" : ""}`}>
        <div
          className={`relative flex w-full items-center justify-center md:w-auto md:justify-start md:gap-2 ${
            showBackButton ? "min-h-[40px] md:min-h-0" : ""
          } ${homeLayout ? "hidden md:flex" : ""}`}
        >
          {showBackButton ? (
            <button
              type="button"
              onClick={handleNavBack}
              className={`absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors md:static md:top-auto md:translate-y-0 ${
                isSolid
                  ? "text-white hover:bg-white/10 active:bg-white/15 md:hover:bg-white/10"
                  : "text-[#111827] hover:bg-black/[0.06] active:bg-black/[0.08] md:hover:bg-black/[0.04]"
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
            </button>
          ) : null}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push("/")}>
            <h1 className="md:hidden" style={{ margin: 0 }}>
              <IndovyaparLogo fontSize={20} variant={isSolid ? "light" : "default"} />
            </h1>
            <h1 className="hidden md:block" style={{ margin: 0 }}>
              <IndovyaparLogo fontSize={26} variant={isSolid ? "light" : "default"} />
            </h1>
          </div>
        </div>

      {/* Search Bar */}
      <div
        className={`flex flex-row items-center md:mx-6 md:flex-1 md:max-w-2xl ${
          homeLayout ? "mt-0 w-full" : "mt-2 md:mt-0"
        }`}
        style={{
          height: 40,
          background: isSolid ? "#FFFFFF" : "rgba(255,255,255,0.72)",
          border: isSolid ? "1px solid rgba(255,255,255,0.95)" : "1px solid rgba(255,255,255,0.8)",
          boxShadow: isSolid
            ? "0 2px 8px rgba(0,0,0,0.12)"
            : "0px 10px 28px rgba(17,24,39,0.08), 0px 2px 6px rgba(17,24,39,0.05)",
          borderRadius: 14,
          ...(isSolid ? {} : { backdropFilter: "blur(10px)" }),
        }}
      >
        {/* Department scope (desktop): All + categories + curated lists */}
        <div ref={deptDropdownRef} className="relative hidden shrink-0 md:block">
          <button
            type="button"
            onClick={() => setDeptDropdownOpen((o) => !o)}
            className="flex flex-row items-center gap-1.5 px-3"
            style={{
              height: 44,
              borderRight: "1px solid #D1D5DC",
              borderRadius: "10px 0 0 10px",
            }}
            aria-haspopup="listbox"
            aria-expanded={deptDropdownOpen}
            aria-label="Search in department"
          >
            <span
              className="max-w-[92px] truncate text-left"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "#4A5565",
              }}
              title={searchScope.kind === "all" ? "All departments" : searchScope.label}
            >
              {deptButtonLabel(searchScope)}
            </span>
            <ChevronDown
              size={15}
              color="#6A7282"
              className={`shrink-0 transition-transform ${deptDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {deptDropdownOpen ? (
            <div
              className="absolute left-0 top-[calc(100%+6px)] z-[130] max-h-72 w-[min(100vw-24px,280px)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              role="listbox"
            >
              <button
                type="button"
                role="option"
                aria-selected={searchScope.kind === "all"}
                onClick={() => {
                  setSearchScope({ kind: "all" });
                  setDeptDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2.5 text-left text-[15px] font-medium transition-colors hover:bg-[#FFF5EF] ${
                  searchScope.kind === "all" ? "bg-[#FFF5EF] text-[#FF6A00]" : "text-slate-800"
                }`}
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                All departments
              </button>
              <div className="my-1 border-t border-slate-100" />
              {MENU_DEPARTMENTS.map((m) => (
                <button
                  key={m.slug}
                  type="button"
                  role="option"
                  aria-selected={searchScope.kind === "menu" && searchScope.slug === m.slug}
                  onClick={() => {
                    setSearchScope({ kind: "menu", slug: m.slug, label: m.label });
                    setDeptDropdownOpen(false);
                  }}
                  className={`flex w-full px-4 py-2.5 text-left text-[15px] font-medium transition-colors hover:bg-[#FFF5EF] ${
                    searchScope.kind === "menu" && searchScope.slug === m.slug
                      ? "bg-[#FFF5EF] text-[#FF6A00]"
                      : "text-slate-800"
                  }`}
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {m.label}
                </button>
              ))}
              {navCategories.length > 0 ? (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  {navCategories.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      role="option"
                      aria-selected={searchScope.kind === "category" && searchScope.slug === c.slug}
                      onClick={() => {
                        setSearchScope({ kind: "category", slug: c.slug, label: c.name });
                        setDeptDropdownOpen(false);
                      }}
                      className={`flex w-full px-4 py-2.5 text-left text-[15px] font-medium transition-colors hover:bg-[#FFF5EF] ${
                        searchScope.kind === "category" && searchScope.slug === c.slug
                          ? "bg-[#FFF5EF] text-[#FF6A00]"
                          : "text-slate-800"
                      }`}
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      {c.name}
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for products, brands and more"
          className="flex-1 outline-none px-4 bg-transparent"
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(10,10,10,0.5)",
          }}
        />

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center shrink-0"
          style={{
            width: 48,
            height: 40,
            background: "#FF6A00",
            borderRadius: "0 10px 10px 0",
          }}
        >
          <Search size={18} color="#FFFFFF" strokeWidth={2} />
        </button>
      </div>

      {/* Right actions — desktop */}
      <div className="hidden md:flex flex-row items-center gap-5 shrink-0">
        {homeLayout && (
          <p className="max-w-[140px] truncate text-sm font-semibold text-slate-700 lg:max-w-[200px]">
            {greeting}
          </p>
        )}
        {/* Account / Login */}
        <div className="relative">
          {isLoggedIn === null ? (
            <div
              className="flex flex-row items-center gap-2 opacity-70"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                fontSize: 18,
                color: isSolid ? "#FFFFFF" : "#0A0A0A",
                whiteSpace: "nowrap",
              }}
            >
              <User size={19} color={isSolid ? "#FFFFFF" : "#0A0A0A"} />
              <span>Account</span>
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/login"
              className={
                isSolid
                  ? "flex flex-row items-center gap-2 rounded-md bg-white px-4 py-2 shadow-sm transition-opacity hover:opacity-95"
                  : "flex flex-row items-center gap-2 transition-opacity hover:opacity-90"
              }
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: isSolid ? 16 : 18,
                color: isSolid ? "#1E5128" : "#FF6A00",
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={19} color={isSolid ? "#1E5128" : "#FF6A00"} />
              <span>Login</span>
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen((o) => !o)}
                className="flex flex-row items-center gap-2 hover:opacity-90 transition-opacity"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: isSolid ? "#FFFFFF" : "#0A0A0A",
                  whiteSpace: "nowrap",
                }}
              >
                <User size={19} color={isSolid ? "#FFFFFF" : "#0A0A0A"} />
                <span>Account &amp; Lists</span>
                <ChevronDown
                  size={16}
                  color={isSolid ? "#FFFFFF" : "#0A0A0A"}
                  className={`transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
            </>
          )}
        </div>

        <Link
          href="/my-orders"
          className="hidden sm:block"
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 500,
            fontSize: 18,
            color: isSolid ? "#FFFFFF" : "#0A0A0A",
            whiteSpace: "nowrap",
          }}
        >
          Orders
        </Link>

        <button type="button" className="relative" onClick={openCartDrawer}>
          <ShoppingCart size={24} color={isSolid ? "#FFFFFF" : "#0A0A0A"} />
          {cartCount > 0 && (
            <span
              className="absolute flex items-center justify-center bg-red-500 text-white font-bold text-[11px] rounded-full min-w-[20px] h-5 px-1"
              style={{
                top: -8,
                left: 12,
              }}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
      </div>
      </div>

      {/* Account dropdown panel rendered for both mobile/desktop toggles */}
      {accountDropdownOpen && (
        <div
          className="fixed left-3 right-3 top-[108px] z-[120] mt-0 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl md:absolute md:left-auto md:right-6 md:top-[62px] md:z-[70] md:mt-1 md:w-52 md:rounded-xl md:shadow-lg"
          role="menu"
        >
          {ACCOUNT_DROPDOWN_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="block px-4 py-2.5 text-slate-800 font-medium hover:bg-[#FFF5EF] hover:text-[#FF6A00] transition-colors"
              style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15 }}
              onClick={() => setAccountDropdownOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-200 mt-2 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-slate-800 font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
              style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15 }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
