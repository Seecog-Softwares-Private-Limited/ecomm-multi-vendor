"use client";

import * as React from "react";
import {
  HelpCircle,
  LogOut,
  Clock,
  FileSearch,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import type { VendorStatusDisplay } from "@/lib/auth";

const VENDOR_LOGIN_PATH = "/vendor/login";

export type VendorStatusCardProps = {
  status: VendorStatusDisplay;
  statusReason?: string | null;
  businessName?: string | null;
};

const STATUS_CONFIG: Record<
  VendorStatusDisplay,
  {
    label: string;
    message: string;
    Icon: LucideIcon;
    accent: string;
    badge: string;
    iconBg: string;
  }
> = {
  pending_verification: {
    label: "Pending Verification",
    message: "Please verify your email to continue.",
    Icon: Clock,
    accent: "from-amber-500 to-amber-600",
    badge: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  under_review: {
    label: "Under Review",
    message: "Your profile is under review by admin. We'll notify you once it's processed.",
    Icon: FileSearch,
    accent: "from-amber-500 to-yellow-500",
    badge: "bg-amber-500/10 text-amber-800 border border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  approved: {
    label: "Approved",
    message: "Your account is approved. You have full access to the vendor dashboard.",
    Icon: CheckCircle2,
    accent: "from-emerald-500 to-teal-500",
    badge: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  rejected: {
    label: "Rejected",
    message: "Your profile was rejected. Please contact support for next steps.",
    Icon: XCircle,
    accent: "from-rose-500 to-red-500",
    badge: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
    iconBg: "bg-rose-500/10 text-rose-600",
  },
  on_hold: {
    label: "On Hold",
    message: "Your account is temporarily on hold. Our team will reach out if we need anything.",
    Icon: PauseCircle,
    accent: "from-orange-500 to-amber-500",
    badge: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
    iconBg: "bg-orange-500/10 text-orange-600",
  },
  blocked: {
    label: "Blocked",
    message: "Your account has been blocked. Contact support to resolve this.",
    Icon: ShieldOff,
    accent: "from-red-600 to-rose-600",
    badge: "bg-red-500/10 text-red-800 border border-red-500/20",
    iconBg: "bg-red-500/10 text-red-600",
  },
};

export function VendorStatusCard({
  status,
  statusReason,
  businessName,
}: VendorStatusCardProps) {
  const router = useRouter();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_verification;
  const showReason = statusReason && statusReason.trim().length > 0;
  const showContactSupport = status === "rejected" || status === "blocked";
  const Icon = config.Icon;

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push(VENDOR_LOGIN_PATH);
      router.refresh();
    } catch {
      router.push(VENDOR_LOGIN_PATH);
      router.refresh();
    }
  };

  const handleContactSupport = () => {
    router.push("/vendor/support");
  };

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const btnPrimary =
    "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm hover:shadow";
  const btnSecondary =
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md">
        {/* Card with elevation and accent bar */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 sm:rounded-3xl">
          {/* Top accent gradient bar */}
          <div
            className={`h-1 w-full bg-gradient-to-r ${config.accent}`}
            aria-hidden
          />

          <div className="p-8 sm:p-10">
            {/* Status icon */}
            <div
              className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}
            >
              <Icon className="h-7 w-7" strokeWidth={2} />
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {businessName ?? "Vendor"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Account Status
            </p>

            {/* Status badge */}
            <div
              className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${config.badge}`}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              {config.label}
            </div>

            {/* Message */}
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
              {config.message}
            </p>

            {/* Reason block */}
            {showReason && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Reason
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {statusReason}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {status === "pending_verification" && (
                <a
                  href="/vendor/profile"
                  className={`${btnBase} ${btnPrimary}`}
                >
                  Complete Profile &amp; KYC
                </a>
              )}
              {(status === "under_review" || status === "on_hold") && (
                <a
                  href="/vendor/profile"
                  className={`${btnBase} ${btnSecondary}`}
                >
                  View Profile
                </a>
              )}
              {showContactSupport && (
                <button
                  type="button"
                  onClick={handleContactSupport}
                  className={`${btnBase} ${btnPrimary}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Contact Support
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={`${btnBase} ${btnSecondary}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Subtle helper text */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Need help? Visit your profile or contact support.
        </p>
      </div>
    </div>
  );
}
