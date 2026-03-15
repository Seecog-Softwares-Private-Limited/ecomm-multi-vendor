"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, User, ShoppingCart, ChevronDown, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IndovyaparLogo } from "./IndovyaparLogo";

const ACCOUNT_DROPDOWN_LINKS = [
  { href: "/profile", label: "My Profile" },
  { href: "/my-orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/my-orders", label: "Return" },
  { href: "/support-tickets", label: "Support" },
] as const;

export function Navbar() {
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (!res.ok) {
        setCartCount(0);
        return;
      }
      const json = await res.json().catch(() => ({}));
      const items = json?.data?.items ?? [];
      setCartCount(Array.isArray(items) ? items.length : 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchCartCount();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [fetchCartCount]);

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
      className="w-full flex flex-row justify-between items-center px-4 sm:px-6 border-b border-gray-100"
      style={{ height: 70, background: "#FFFFFF" }}
    >
      {/* Logo */}
      <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push("/")}>
        <h1 style={{ margin: 0 }}>
          <IndovyaparLogo fontSize={26} />
        </h1>
      </div>

      {/* Search Bar */}
      <div
        className="flex flex-row items-center flex-1 max-w-2xl mx-6"
        style={{
          height: 44,
          background: "#FFFFFF",
          border: "1px solid #D1D5DC",
          boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
          borderRadius: 10,
        }}
      >
        {/* All dropdown */}
        <button
          className="flex flex-row items-center gap-2 px-3 shrink-0"
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
            fontSize: 18,
            color: "rgba(10,10,10,0.5)",
          }}
        />

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center shrink-0"
          style={{
            width: 64,
            height: 44,
            background: "#FF6A00",
            borderRadius: "0 10px 10px 0",
          }}
        >
          <Search size={22} color="#FFFFFF" strokeWidth={2} />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex flex-row items-center gap-5 shrink-0">
        {/* Account / Login */}
        <div className="relative" ref={accountDropdownRef}>
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
              {accountDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1 py-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 z-50"
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

        <button type="button" className="relative" onClick={() => router.push("/cart")}>
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
    </div>
  );
}
