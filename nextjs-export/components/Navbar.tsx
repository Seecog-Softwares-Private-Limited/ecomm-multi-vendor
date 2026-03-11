"use client";

import { useState } from "react";
import { Search, User, ShoppingCart, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <div
      className="w-full flex flex-row justify-between items-center px-10"
      style={{ height: 70, background: "#FFFFFF" }}
    >
      {/* Logo */}
      <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push("/")}>
        <h1
          style={{
            fontFamily: "'Katibeh', cursive",
            fontWeight: 400,
            fontSize: 26,
            lineHeight: "32px",
            color: "#FF5400",
          }}
        >
          Indovyapar
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

        <button>
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

        <button className="relative">
          <ShoppingCart size={24} color="#0A0A0A" />
          <span
            className="absolute flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              top: -8,
              left: 12,
              background: "#FF4D4D",
              borderRadius: "50%",
            }}
          >
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: "#FFFFFF",
              }}
            >
              3
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
