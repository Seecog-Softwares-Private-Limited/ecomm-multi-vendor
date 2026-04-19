"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminLayout } from "@/app/layouts/AdminLayout";

const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminAuthPage(path: string | null): boolean {
  if (!path) return true;
  return path === ADMIN_LOGIN_PATH || path.startsWith(ADMIN_LOGIN_PATH + "/");
}

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isAdminAuthPage(pathname)) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    fetch("/api/admin/me", { credentials: "include", signal: ac.signal })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          // Any non-2xx (401, 403, 500, …) — send to login
          const callbackUrl = encodeURIComponent(pathname ?? "/admin");
          routerRef.current.replace(
            `${ADMIN_LOGIN_PATH}?callbackUrl=${callbackUrl}`
          );
          return;
        }
        setAuthChecked(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const aborted =
          err instanceof DOMException && err.name === "AbortError";
        if (!aborted) {
          routerRef.current.replace(
            `${ADMIN_LOGIN_PATH}?callbackUrl=${encodeURIComponent(pathname ?? "/admin")}`
          );
        }
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [pathname]);

  if (isAdminAuthPage(pathname)) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const activePath = pathname ?? "/admin";
  return <AdminLayout activePath={activePath}>{children}</AdminLayout>;
}
