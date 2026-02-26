"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VendorLayout } from "@/app/vendor/components/VendorLayout";

const VENDOR_LOGIN_PATH = "/vendor/login";
const VENDOR_REGISTER_PATH = "/vendor/register";

function isVendorAuthPage(path: string | null) {
  if (!path) return true;
  return (
    path === VENDOR_LOGIN_PATH ||
    path.startsWith(`${VENDOR_LOGIN_PATH}/`) ||
    path === VENDOR_REGISTER_PATH ||
    path.startsWith(`${VENDOR_REGISTER_PATH}/`)
  );
}

export function VendorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname || isVendorAuthPage(pathname)) {
      return;
    }
    let cancelled = false;
    fetch("/api/vendor/me", { credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          const callbackUrl = encodeURIComponent(pathname ?? "/vendor");
          router.replace(`${VENDOR_LOGIN_PATH}?callbackUrl=${callbackUrl}`);
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace(`${VENDOR_LOGIN_PATH}?callbackUrl=${encodeURIComponent(pathname ?? "/vendor")}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (isVendorAuthPage(pathname ?? null)) {
    return <>{children}</>;
  }

  return (
    <VendorLayout activePath={pathname ?? "/vendor"}>
      {children}
    </VendorLayout>
  );
}
