"use client";

import { memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { APP_VERSION } from "@/lib/profile/profile-dashboard-utils";

type OptionItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
};

type OptionGroup = {
  title: string;
  items: OptionItem[];
};

type ProfileAccountOptionsProps = {
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onDeleteAccount?: () => void;
};

export const ProfileAccountOptions = memo(function ProfileAccountOptions({
  onEditProfile,
  onChangePassword,
  onDeleteAccount,
}: ProfileAccountOptionsProps) {
  const groups: OptionGroup[] = [
    {
      title: "Account",
      items: [
        { label: "Personal Information", onClick: onEditProfile },
        { label: "Addresses", href: "/address-management" },
      ],
    },
    {
      title: "Shopping",
      items: [
        { label: "Orders", href: "/my-orders" },
        { label: "Wishlist", href: "/wishlist" },
        { label: "Cart", href: "/cart" },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Help Center", href: "/support-tickets" },
        { label: "Contact Support", href: "/support-tickets" },
        { label: "Report a Problem", href: "/support-tickets" },
        { label: "FAQs", href: "/info/about-us" },
      ],
    },
    {
      title: "Application",
      items: [
        { label: "About", href: "/info/about-us" },
        { label: "Privacy Policy", href: "/info/privacy-policy" },
        { label: "Terms", href: "/info/terms-of-service" },
        { label: `App Version ${APP_VERSION}` },
      ],
    },
    {
      title: "Security",
      items: [
        { label: "Change Password", onClick: onChangePassword },
        { label: "Delete Account", onClick: onDeleteAccount },
      ],
    },
  ];

  return (
    <section
      id="account-settings"
      aria-label="Account options"
      className="space-y-4 sm:space-y-5"
    >
      {groups.map((group) => (
        <div
          key={group.title}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 sm:px-5">
            {group.title}
          </h3>
          <ul>
            {group.items.map((item) => {
              const rowClass =
                "flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6A00]/30 sm:px-5";

              if (item.onClick) {
                return (
                  <li key={item.label} className="border-b border-slate-50 last:border-0">
                    <button type="button" onClick={item.onClick} className={rowClass}>
                      {item.label}
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    </button>
                  </li>
                );
              }

              if (item.href) {
                return (
                  <li key={item.label} className="border-b border-slate-50 last:border-0">
                    <Link href={item.href} className={rowClass}>
                      {item.label}
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label} className="border-b border-slate-50 px-4 py-3.5 last:border-0 sm:px-5">
                  <span className="text-sm text-slate-500">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
});
