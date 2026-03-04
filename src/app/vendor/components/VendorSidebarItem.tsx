"use client";

import * as React from "react";
import { Link } from "../../components/Link";
import { Lock, type LucideIcon } from "lucide-react";

const LOCKED_TOOLTIP = "Complete Profile & KYC to unlock";

export type VendorSidebarItemProps = {
  icon: LucideIcon;
  label: string;
  route: string;
  disabled?: boolean;
  tooltip?: string;
  active?: boolean;
};

export function VendorSidebarItem({
  icon: Icon,
  label,
  route,
  disabled = false,
  tooltip = LOCKED_TOOLTIP,
  active = false,
}: VendorSidebarItemProps) {
  if (disabled) {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 px-4 py-3 rounded-xl text-slate-400 opacity-60 transition-opacity"
        title={tooltip}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 font-medium">{label}</span>
        <Lock className="h-4 w-4 shrink-0 text-slate-300" />
      </div>
    );
  }

  return (
    <Link
      href={route}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
