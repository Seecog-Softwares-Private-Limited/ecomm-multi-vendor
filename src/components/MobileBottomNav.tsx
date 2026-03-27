"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ClipboardList, Heart, User } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/category/electronics",
    label: "Categories",
    icon: LayoutGrid,
    isActive: (pathname) => pathname.startsWith("/category"),
  },
  {
    href: "/my-orders",
    label: "Orders",
    icon: ClipboardList,
    isActive: (pathname) => pathname.startsWith("/my-orders") || pathname.startsWith("/order"),
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: Heart,
    isActive: (pathname) => pathname.startsWith("/wishlist"),
  },
  {
    href: "/profile",
    label: "Account",
    icon: User,
    isActive: (pathname) => pathname.startsWith("/profile") || pathname.startsWith("/login"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
      style={{
        paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Mobile bottom navigation"
    >
      <div className="mx-auto flex h-[68px] max-w-[560px] items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={`flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 ${
                active ? "text-[#FF6A00]" : "text-[#6B7280]"
              }`}
            >
              <Icon size={20} />
              <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
