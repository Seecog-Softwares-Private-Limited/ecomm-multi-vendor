"use client";

import { VendorLayout } from "@/app/vendor/components/VendorLayout";
import { usePathname } from "next/navigation";

export function VendorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <VendorLayout activePath={pathname ?? "/vendor"}>
      {children}
    </VendorLayout>
  );
}
