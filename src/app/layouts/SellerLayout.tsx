"use client";

import { Link } from "../components/Link";
import {
  LayoutDashboard, Package, ShoppingBag, FileText,
  Settings, LogOut, Store, Menu, X
} from "lucide-react";
import * as React from "react";

export type SellerLayoutProps = {
  children: React.ReactNode;
  activePath?: string;
};

export function SellerLayout({ children, activePath = "" }: SellerLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: "Dashboard", href: "/seller", icon: LayoutDashboard },
    { name: "Products", href: "/seller/inventory", icon: Package },
    { name: "Orders", href: "/seller/orders", icon: ShoppingBag },
    { name: "Reports", href: "/seller/reports", icon: FileText },
    { name: "Settings", href: "/seller/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/seller") {
      return activePath === "/seller";
    }
    return activePath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-gray-400 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border-2 border-gray-400 bg-white hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <Link href="/seller" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900">Seller Center</h1>
                <p className="text-xs text-gray-600">Tech Store Pro</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold text-sm"
            >
              View Store
            </Link>
            <Link
              href="/seller/login"
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t-2 border-gray-300 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 border-2 ${
                      active
                        ? "border-gray-800 bg-gray-200"
                        : "border-gray-400 bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-700" />
                    <span className="font-bold text-gray-900">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white border-b-2 border-gray-300">
        <nav className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-4 border-b-4 ${
                    active
                      ? "border-gray-800 bg-gray-50"
                      : "border-transparent hover:bg-gray-50 hover:border-gray-400"
                  } transition-colors`}
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-900">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
