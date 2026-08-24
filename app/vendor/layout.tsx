import type { Metadata } from "next";
import { VendorLayoutWrapper } from "./VendorLayoutWrapper";

export const metadata: Metadata = {
  title: "Vendor",
  description: "IndoVyapar Vendor App — manage products, orders, and your seller account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <VendorLayoutWrapper>{children}</VendorLayoutWrapper>;
}
