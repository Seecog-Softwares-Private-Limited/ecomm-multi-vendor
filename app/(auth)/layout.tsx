import { RootLayout } from "@/app/layouts/RootLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout showHeaderFooter={false}>{children}</RootLayout>;
}
