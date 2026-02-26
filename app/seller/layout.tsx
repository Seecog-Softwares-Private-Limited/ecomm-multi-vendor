import { SellerLayoutWrapper } from "./SellerLayoutWrapper";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerLayoutWrapper>{children}</SellerLayoutWrapper>;
}
