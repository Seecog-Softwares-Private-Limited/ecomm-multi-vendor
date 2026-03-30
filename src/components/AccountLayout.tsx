"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { User, Package, MapPin, Heart, Headphones } from "lucide-react";
import { Navbar } from "./Navbar";

const SIDEBAR_LINKS = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/my-orders", label: "My Orders", icon: Package },
  { href: "/address-management", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/support-tickets", label: "Support", icon: Headphones },
] as const;

export function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [isCustomer, setIsCustomer] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          setIsCustomer(false);
          return;
        }
        return res.json();
      })
      .then((data) => {
        setIsCustomer(Boolean(data?.data?.user && data.data.user.role === "CUSTOMER"));
      })
      .catch(() => setIsCustomer(false));
  }, []);

  const visibleSidebarLinks = useMemo(() => {
    if (isCustomer === false) {
      return SIDEBAR_LINKS.filter((l) => l.href === "/support-tickets");
    }
    return [...SIDEBAR_LINKS];
  }, [isCustomer]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile tabs */}
        <div className="lg:hidden mb-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
            <nav className="flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden">
              {visibleSidebarLinks.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  pathname.startsWith(href + "/") ||
                  (href === "/my-orders" &&
                    (pathname.startsWith("/order-detail/") || pathname.startsWith("/track-order/")));

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive ? "bg-[#FF6A00] text-white" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-5 sticky top-24">
              <nav className="space-y-1">
                {visibleSidebarLinks.map(({ href, label, icon: Icon }) => {
                  const isActive =
                    pathname === href ||
                    pathname.startsWith(href + "/") ||
                    (href === "/my-orders" && (pathname.startsWith("/order-detail/") || pathname.startsWith("/track-order/")));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                        isActive
                          ? "bg-[#FF6A00] text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
