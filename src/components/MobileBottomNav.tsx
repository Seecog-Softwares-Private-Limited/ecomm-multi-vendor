"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ClipboardList, Heart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    color: "#FF6A00",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/category/electronics",
    label: "Categories",
    icon: LayoutGrid,
    color: "#2563EB",
    isActive: (pathname) => pathname.startsWith("/category"),
  },
  {
    href: "/my-orders",
    label: "Orders",
    icon: ClipboardList,
    color: "#7C3AED",
    isActive: (pathname) => pathname.startsWith("/my-orders") || pathname.startsWith("/order"),
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: Heart,
    color: "#E11D48",
    isActive: (pathname) => pathname.startsWith("/wishlist"),
  },
  {
    href: "/profile",
    label: "Account",
    icon: User,
    color: "#0EA5A4",
    isActive: (pathname) => pathname.startsWith("/profile") || pathname.startsWith("/login"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/60 bg-white/80 backdrop-blur-xl md:hidden"
      style={{
        paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
        boxShadow: "0 -12px 30px rgba(15, 23, 42, 0.12)",
      }}
      aria-label="Mobile bottom navigation"
    >
      <div className="mx-auto flex h-[68px] max-w-[560px] items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon, color, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition ${
                active ? "bg-white/80 shadow-sm" : ""
              }`}
              style={{ color: active ? color : "#6B7280" }}
            >
              <Icon size={20} color={active ? color : color} opacity={active ? 1 : 0.72} />
              <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
