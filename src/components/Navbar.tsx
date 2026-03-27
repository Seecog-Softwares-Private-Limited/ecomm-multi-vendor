"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, User, ShoppingCart, ChevronDown, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IndovyaparLogo } from "./IndovyaparLogo";
import { getGuestCartCount, subscribeToGuestCartChanges } from "@/lib/guest-cart";
import { useCartDrawer } from "@/contexts/CartDrawerContext";

const ACCOUNT_DROPDOWN_LINKS = [
  { href: "/profile", label: "My Profile" },
  { href: "/my-orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/my-orders", label: "Return" },
  { href: "/support-tickets", label: "Support" },
] as const;

const CART_UPDATED_EVENT = "indovyapar-cart-updated";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
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
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    if (accountDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [accountDropdownOpen]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
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

  return (
    <div
      ref={accountDropdownRef}
      className="relative z-[60] w-full border-b border-white/60 px-3 py-2 backdrop-blur-xl sm:px-6 md:flex md:h-[70px] md:flex-row md:items-center md:justify-between md:py-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.74) 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between md:block">
        <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push("/")}>
          <h1 className="md:hidden" style={{ margin: 0 }}>
            <IndovyaparLogo fontSize={20} />
          </h1>
          <h1 className="hidden md:block" style={{ margin: 0 }}>
            <IndovyaparLogo fontSize={26} />
          </h1>
        </div>

        {/* Right actions - mobile */}
        <div className="flex flex-row items-center gap-3 shrink-0 md:hidden">
          {isLoggedIn === null ? (
            <span
              className="opacity-70"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: "#0A0A0A",
                whiteSpace: "nowrap",
              }}
            >
              Account
            </span>
          ) : !isLoggedIn ? (
            <Link
              href="/login"
              className="flex flex-row items-center gap-1 hover:opacity-90 transition-opacity"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#FF6A00",
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAccountDropdownOpen((o) => !o)}
              className="flex flex-row items-center gap-1 hover:opacity-90 transition-opacity"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: "#0A0A0A",
                whiteSpace: "nowrap",
              }}
            >
              <User size={16} color="#0A0A0A" />
              <span>Account</span>
              <ChevronDown
                size={14}
                color="#0A0A0A"
                className={`transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
          )}

          <button type="button" className="relative" onClick={openCartDrawer}>
            <ShoppingCart size={20} color="#0A0A0A" />
            {cartCount > 0 && (
              <span
                className="absolute flex items-center justify-center bg-red-500 text-white font-bold text-[10px] rounded-full min-w-[18px] h-[18px] px-1"
                style={{ top: -7, left: 10 }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="mt-2 flex flex-row items-center md:mt-0 md:mx-6 md:flex-1 md:max-w-2xl"
        style={{
          height: 40,
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0px 10px 28px rgba(17,24,39,0.08), 0px 2px 6px rgba(17,24,39,0.05)",
          borderRadius: 14,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* All dropdown */}
        <button
          className="hidden md:flex flex-row items-center gap-2 px-3 shrink-0"
          style={{
            height: 44,
            borderRight: "1px solid #D1D5DC",
            borderRadius: "10px 0 0 10px",
          }}
        >
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: "#4A5565",
            }}
          >
            All
          </span>
          <ChevronDown size={15} color="#6A7282" />
        </button>

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

      {/* Right actions */}
      <div className="hidden md:flex flex-row items-center gap-5 shrink-0">
        {/* Account / Login */}
        <div className="relative">
          {isLoggedIn === null ? (
            <div
              className="flex flex-row items-center gap-2 opacity-70"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                fontSize: 18,
                color: "#0A0A0A",
                whiteSpace: "nowrap",
              }}
            >
              <User size={19} color="#0A0A0A" />
              <span>Account</span>
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/login"
              className="flex flex-row items-center gap-2 hover:opacity-90 transition-opacity"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 18,
                color: "#FF6A00",
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={19} />
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
                  color: "#0A0A0A",
                  whiteSpace: "nowrap",
                }}
              >
                <User size={19} color="#0A0A0A" />
                <span>Account &amp; Lists</span>
                <ChevronDown
                  size={16}
                  color="#0A0A0A"
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
            color: "#0A0A0A",
            whiteSpace: "nowrap",
          }}
        >
          Returns &amp; Orders
        </Link>

        <button type="button" className="relative" onClick={openCartDrawer}>
          <ShoppingCart size={24} color="#0A0A0A" />
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
