"use client";

import { memo } from "react";
import Link from "next/link";
import {
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  Headphones,
  Settings,
} from "lucide-react";

type QuickAction = {
  href: string;
  label: string;
  emoji: string;
  icon: typeof Package;
  badge?: number;
  onClick?: () => void;
};

type ProfileQuickActionsProps = {
  orderCount?: number;
  wishlistCount?: number;
  cartCount?: number;
  addressCount?: number;
  onCartClick?: () => void;
};

export const ProfileQuickActions = memo(function ProfileQuickActions({
  orderCount = 0,
  wishlistCount = 0,
  cartCount = 0,
  addressCount = 0,
  onCartClick,
}: ProfileQuickActionsProps) {
  const actions: QuickAction[] = [
    { href: "/my-orders", label: "My Orders", emoji: "📦", icon: Package, badge: orderCount || undefined },
    { href: "/wishlist", label: "Wishlist", emoji: "❤️", icon: Heart, badge: wishlistCount || undefined },
    {
      href: "/cart",
      label: "Cart",
      emoji: "🛒",
      icon: ShoppingCart,
      badge: cartCount || undefined,
      onClick: onCartClick,
    },
    {
      href: "/address-management",
      label: "Addresses",
      emoji: "📍",
      icon: MapPin,
      badge: addressCount || undefined,
    },
    { href: "/support-tickets", label: "Support", emoji: "🎧", icon: Headphones },
    { href: "#account-settings", label: "Settings", emoji: "⚙️", icon: Settings },
  ];

  return (
    <section aria-label="Quick actions" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-bold text-slate-900 sm:text-lg">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {actions.map((action) => {
          const content = (
            <>
              <span className="text-2xl" aria-hidden>
                {action.emoji}
              </span>
              <span className="mt-2 text-sm font-semibold text-slate-800">{action.label}</span>
              {action.badge != null && action.badge > 0 && (
                <span className="absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[10px] font-bold text-white">
                  {action.badge > 99 ? "99+" : action.badge}
                </span>
              )}
            </>
          );

          const className =
            "relative flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center transition hover:border-[#FF6A00]/30 hover:bg-orange-50/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30";

          if (action.onClick) {
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={className}
                aria-label={`${action.label}${action.badge ? `, ${action.badge} items` : ""}`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className={className}
              aria-label={`${action.label}${action.badge ? `, ${action.badge} items` : ""}`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
});
