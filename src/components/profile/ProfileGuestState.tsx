"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Package, Heart, Zap } from "lucide-react";

export function ProfileGuestState() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 sm:py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6A00] to-[#166534] text-2xl font-bold text-white">
            IV
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Welcome to IndoVyapar</h1>
          <p className="mb-6 text-slate-600">Sign in to unlock your personalized account dashboard.</p>

          <ul className="mb-8 space-y-3 text-left text-sm text-slate-700">
            <li className="flex items-center gap-3">
              <Package className="h-5 w-5 shrink-0 text-[#FF6A00]" aria-hidden />
              Track Orders
            </li>
            <li className="flex items-center gap-3">
              <Heart className="h-5 w-5 shrink-0 text-[#FF6A00]" aria-hidden />
              Save Wishlist
            </li>
            <li className="flex items-center gap-3">
              <Zap className="h-5 w-5 shrink-0 text-[#FF6A00]" aria-hidden />
              Faster Checkout
            </li>
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#FF6A00]/40 hover:text-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
