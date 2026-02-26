import { RootLayout } from "@/app/layouts/RootLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout showHeaderFooter={true}>{children}</RootLayout>;
}
