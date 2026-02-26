import { VendorLayoutWrapper } from "./VendorLayoutWrapper";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VendorLayoutWrapper>{children}</VendorLayoutWrapper>;
}
