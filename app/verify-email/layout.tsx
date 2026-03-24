import { RootLayout } from "@/app/layouts/RootLayout";

/** No site chrome — same as (auth) layout; lives outside (auth) for reliable deploy paths. */
export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout showHeaderFooter={false}>{children}</RootLayout>;
}
