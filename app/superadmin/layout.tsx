"use client";

import { usePathname } from "next/navigation";
import { SuperAdminLayout } from "@/app/superadmin/SuperAdminLayout";

export default function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/superadmin/login") {
    return <>{children}</>;
  }
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
