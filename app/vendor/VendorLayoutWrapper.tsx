"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VendorLayout } from "@/app/vendor/components/VendorLayout";
import { VendorStatusCard } from "@/app/vendor/components/VendorStatusCard";
import { authService } from "@/services/auth.service";
import { LogOut } from "lucide-react";
import type { VendorStatusDisplay } from "@/lib/auth";

const VENDOR_LOGIN_PATH = "/vendor/login";
const VENDOR_REGISTER_PATH = "/vendor/register";
const VENDOR_STATUS_PATH = "/vendor/status";

function isVendorAuthPage(path: string | null) {
  if (!path) return true;
  return (
    path === VENDOR_LOGIN_PATH ||
    path.startsWith(`${VENDOR_LOGIN_PATH}/`) ||
    path === VENDOR_REGISTER_PATH ||
    path.startsWith(`${VENDOR_REGISTER_PATH}/`)
  );
}

/** Paths a vendor can access when not approved (status screen, profile to complete KYC, support). */
function isAllowedWhenNotApproved(path: string | null) {
  if (!path) return false;
  return (
    path === VENDOR_STATUS_PATH ||
    path.startsWith(`${VENDOR_STATUS_PATH}/`) ||
    path === "/vendor/profile" ||
    path.startsWith("/vendor/profile/") ||
    path === "/vendor/support" ||
    path.startsWith("/vendor/support/") ||
    path === "/vendor/verify" ||
    path.startsWith("/vendor/verify/")
  );
}

type MeData = {
  vendorId: string;
  email: string;
  role: string;
  status: VendorStatusDisplay;
  statusReason: string | null;
  businessName: string | null;
};

export function VendorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<MeData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!pathname || isVendorAuthPage(pathname)) {
      setAuthChecked(true);
      return;
    }
    let cancelled = false;
    fetch("/api/vendor/me", { credentials: "include" })
      .then((res) => {
        if (cancelled) return res;
        if (res.status === 401 || res.status === 403) {
          const callbackUrl = encodeURIComponent(pathname ?? "/vendor");
          router.replace(`${VENDOR_LOGIN_PATH}?callbackUrl=${callbackUrl}`);
          return res;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json.data) {
          setMe(json.data as MeData);
          const status = json.data.status as VendorStatusDisplay;
          const approved = status === "approved";
          if (!approved && !isAllowedWhenNotApproved(pathname)) {
            router.replace(VENDOR_STATUS_PATH);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace(`${VENDOR_LOGIN_PATH}?callbackUrl=${encodeURIComponent(pathname ?? "/vendor")}`);
        }
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

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

  if (isVendorAuthPage(pathname ?? null)) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const approved = me?.status === "approved";
  const allowedPath = isAllowedWhenNotApproved(pathname);

  if (!approved && !allowedPath) {
    router.replace(VENDOR_STATUS_PATH);
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4">
          <span className="text-lg font-bold text-[#1E293B]">Indovypar</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          {me && (
            <VendorStatusCard
              status={me.status}
              statusReason={me.statusReason}
              businessName={me.businessName}
            />
          )}
        </main>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4">
          <a href="/vendor/status" className="text-lg font-bold text-[#1E293B]">
            Indovypar
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return (
    <VendorLayout activePath={pathname ?? "/vendor"} vendorStatus="approved">
      {children}
    </VendorLayout>
  );
}
