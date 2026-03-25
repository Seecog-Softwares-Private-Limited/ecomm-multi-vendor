"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    path.startsWith(`${VENDOR_REGISTER_PATH}/`) ||
    path === "/vendor/forgot-password" ||
    path.startsWith("/vendor/forgot-password/") ||
    path === "/vendor/reset-password" ||
    path.startsWith("/vendor/reset-password/")
  );
}

/** Paths a vendor can access when not approved (dashboard shows onboarding card, profile, support). */
function isAllowedWhenNotApproved(path: string | null) {
  if (!path) return false;
  return (
    path === VENDOR_STATUS_PATH ||
    path.startsWith(`${VENDOR_STATUS_PATH}/`) ||
    path === "/vendor" ||
    path === "/vendor/profile" ||
    path.startsWith("/vendor/profile") ||
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
  rawStatus: string | null;
  statusReason: string | null;
  businessName: string | null;
};

const VENDOR_ME_TIMEOUT_MS = 20_000;

export function VendorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [me, setMe] = useState<MeData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const fetchMe = useCallback(() => {
    return fetch("/api/vendor/me", { credentials: "include" })
      .then((res) => {
        if (res.status === 401 || res.status === 403) return res;
        return res.json();
      })
      .then((json) => {
        if (json?.success && json.data) {
          setMe(json.data as MeData);
          return json.data as MeData;
        }
        return null;
      });
  }, []);

  useEffect(() => {
    if (!pathname || isVendorAuthPage(pathname)) {
      setAuthChecked(true);
      return;
    }
    setBootstrapError(null);
    let cancelled = false;
    const ac = new AbortController();
    const t = window.setTimeout(() => ac.abort(), VENDOR_ME_TIMEOUT_MS);

    fetch("/api/vendor/me", { credentials: "include", signal: ac.signal })
      .then((res) => {
        if (cancelled) return res;
        if (res.status === 401 || res.status === 403) {
          const callbackUrl = encodeURIComponent(pathname ?? "/vendor");
          routerRef.current.replace(`${VENDOR_LOGIN_PATH}?callbackUrl=${callbackUrl}`);
          return res;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json && typeof json === "object" && "success" in json && json.success && json.data) {
          setMe(json.data as MeData);
          setBootstrapError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const aborted =
          err instanceof DOMException && err.name === "AbortError";
        if (aborted) {
          setBootstrapError(
            "Vendor session check timed out. Is MySQL running and DATABASE_URL correct? Try refreshing the page."
          );
          return;
        }
        routerRef.current.replace(
          `${VENDOR_LOGIN_PATH}?callbackUrl=${encodeURIComponent(pathname ?? "/vendor")}`
        );
      })
      .finally(() => {
        window.clearTimeout(t);
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(t);
    };
  }, [pathname]);

  /** Never call router.replace during render — it can break navigation and leave the shell stuck loading. */
  useEffect(() => {
    if (!authChecked || isVendorAuthPage(pathname ?? null)) return;
    const approved = me?.status === "approved";
    if (approved) return;
    if (!isAllowedWhenNotApproved(pathname)) {
      routerRef.current.replace(VENDOR_STATUS_PATH);
    }
  }, [authChecked, pathname, me]);

  // When not approved, refetch status on tab focus and every 20s so vendor sees approval without manual refresh
  const approved = me?.status === "approved";
  useEffect(() => {
    if (!me || approved || isVendorAuthPage(pathname ?? null)) return;
    const onVisible = () => {
      fetchMe(); // setMe() in fetchMe updates state; no router.refresh() to avoid extra request
    };
    const id = setInterval(onVisible, 20000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [me, approved, pathname, fetchMe]);

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

  if (bootstrapError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-6 text-center">
        <p className="max-w-md text-sm text-[#64748B]">{bootstrapError}</p>
        <button
          type="button"
          className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB]"
          onClick={() => window.location.reload()}
        >
          Refresh page
        </button>
      </div>
    );
  }

  const allowedPath = isAllowedWhenNotApproved(pathname);

  if (!approved && !allowedPath) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4">
          <span className="text-lg font-bold text-[#1E293B]">Indovypar</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          {me ? (
            <VendorStatusCard
              status={me.status}
              rawStatus={me.rawStatus}
              statusReason={me.statusReason}
              businessName={me.businessName}
            />
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-[#64748B]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p>Redirecting to your vendor status…</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (!approved) {
    return (
      <VendorLayout
        activePath={pathname ?? "/vendor"}
        vendorStatus={me?.status ?? "under_review"}
        businessName={me?.businessName}
      >
        {children}
      </VendorLayout>
    );
  }

  return (
    <VendorLayout
      activePath={pathname ?? "/vendor"}
      vendorStatus="approved"
      businessName={me?.businessName}
    >
      {children}
    </VendorLayout>
  );
}
