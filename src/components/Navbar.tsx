"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User, ShoppingCart, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { IndovyaparLogo } from "./IndovyaparLogo";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
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
        <button className="flex flex-row items-center gap-2" onClick={() => router.push("/login")}>
          <User size={19} color="#0A0A0A" />
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: "#0A0A0A",
              whiteSpace: "nowrap",
            }}
          >
            Account &amp; Lists
          </span>
        </button>

        <button onClick={() => router.push("/my-orders")}>
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: "#0A0A0A",
              whiteSpace: "nowrap",
            }}
          >
            Returns &amp; Orders
          </span>
        </button>

        <button className="relative" onClick={() => router.push("/cart")}>
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
