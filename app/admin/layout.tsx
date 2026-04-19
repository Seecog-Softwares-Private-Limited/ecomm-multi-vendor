import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth/jwt";
import { authConfig } from "@/lib/auth/config";
import { AdminLayoutWrapper } from "./AdminLayoutWrapper";

const ADMIN_LOGIN = "/admin/login";

/** Resolve current pathname from request headers injected by middleware or Next.js internals. */
async function resolvePathname(): Promise<string> {
  const h = await headers();
  if (h.get("x-pathname")) return h.get("x-pathname") as string;
  // Fallback: parse next-url header set by Next.js
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

  // Let the login page render without any auth gate.
  // When pathname is empty the middleware header wasn't injected — fall through to
  // the client-side AdminLayoutWrapper check to avoid an infinite redirect loop.
  const isLoginPage =
    pathname === ADMIN_LOGIN || pathname.startsWith(ADMIN_LOGIN + "/");

  if (pathname && !isLoginPage) {
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookieName)?.value ?? null;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      redirect(`${ADMIN_LOGIN}?callbackUrl=${encodeURIComponent(pathname || "/admin")}`);
    }

    if (session.role !== "ADMIN") {
      redirect("/vendor");
    }
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
