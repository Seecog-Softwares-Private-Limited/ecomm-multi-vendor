import { RootLayout } from "@/app/layouts/RootLayout";

export default function VerifyEmailUnderscoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout showHeaderFooter={false}>{children}</RootLayout>;
}
