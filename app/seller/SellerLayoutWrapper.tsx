"use client";

import { SellerLayout } from "@/app/layouts/SellerLayout";
import { usePathname } from "next/navigation";

export function SellerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/seller/login") {
    return <>{children}</>;
  }
  return (
    <SellerLayout activePath={pathname ?? "/seller"}>
      {children}
    </SellerLayout>
  );
}
