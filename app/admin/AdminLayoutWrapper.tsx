"use client";

import { AdminLayout } from "@/app/layouts/AdminLayout";
import { usePathname } from "next/navigation";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  const activePath = pathname ?? "/admin";
  return <AdminLayout activePath={activePath}>{children}</AdminLayout>;
}
