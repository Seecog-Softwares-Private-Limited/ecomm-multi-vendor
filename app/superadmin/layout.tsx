"use client";

import { usePathname } from "next/navigation";
import { SuperAdminLayout } from "@/app/superadmin/SuperAdminLayout";

function isSuperAdminLoginPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return p === "/superadmin/login";
}

export default function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (isSuperAdminLoginPath(pathname)) {
    return <>{children}</>;
  }
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
