import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth/jwt";
import { authConfig } from "@/lib/auth/config";
import { VendorLayoutWrapper } from "./VendorLayoutWrapper";

const VENDOR_LOGIN = "/vendor/login";

/** Public vendor paths that don't require authentication. */
function isVendorPublicPath(pathname: string): boolean {
  return (
    pathname === VENDOR_LOGIN ||
    pathname.startsWith(VENDOR_LOGIN + "/") ||
    pathname === "/vendor/register" ||
    pathname.startsWith("/vendor/register/") ||
    pathname === "/vendor/forgot-password" ||
    pathname.startsWith("/vendor/forgot-password/") ||
    pathname === "/vendor/reset-password" ||
    pathname.startsWith("/vendor/reset-password/")
  );
}

/** Resolve current pathname from request headers injected by middleware or Next.js internals. */
async function resolvePathname(): Promise<string> {
  const h = await headers();
  if (h.get("x-pathname")) return h.get("x-pathname") as string;
  const nextUrl = h.get("next-url");
  if (nextUrl) {
    try {
      return new URL(nextUrl).pathname;
    } catch {
      return nextUrl;
    }
  }
  return "";
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = await resolvePathname();

  // Public vendor pages (login, register, etc.) don't need an auth check.
  // When pathname is empty the middleware header wasn't injected — fall through to
  // the client-side VendorLayoutWrapper check to avoid an infinite redirect loop.
  if (!pathname || isVendorPublicPath(pathname)) {
    return <VendorLayoutWrapper>{children}</VendorLayoutWrapper>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value ?? null;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    redirect(`${VENDOR_LOGIN}?callbackUrl=${encodeURIComponent(pathname || "/vendor")}`);
  }

  // Allow SELLER or ADMIN roles on vendor routes
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    redirect("/login");
  }

  return <VendorLayoutWrapper>{children}</VendorLayoutWrapper>;
}
