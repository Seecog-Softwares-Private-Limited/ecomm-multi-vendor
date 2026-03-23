import { redirect } from "next/navigation";

/**
 * Legacy / mistyped URL: some emails or links use verify_email (underscore).
 * Canonical route is /verify-email (hyphen).
 */
type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailUnderscoreRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token.trim() : "";
  if (token) {
    redirect(`/verify-email?token=${encodeURIComponent(token)}`);
  }
  redirect("/verify-email");
}
