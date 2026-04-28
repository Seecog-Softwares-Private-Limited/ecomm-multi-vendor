import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getVerifiedSession } from "@/lib/auth/middleware-auth";
import {
  isAuthPage,
  isAuthRequiredPath,
  isSellerRoute,
  isAdminRoute,
  isSuperAdminRoute,
  isSellerLoginPage,
  isVendorLoginPage,
  isVendorPublicPage,
  isAdminLoginPage,
  isSuperAdminLoginPage,
  SELLER_ROLES,
  ADMIN_ROLE,
  VENDOR_LOGIN,
  ADMIN_LOGIN,
} from "@/lib/auth/middleware-routes";

const LOGIN_PATH = "/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fix typo: /login/admin/login → /admin/login
  if (pathname === "/login/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Pass through all public auth pages without a session check
  if (
    isAuthPage(pathname) ||
    isSellerLoginPage(pathname) ||
    isVendorLoginPage(pathname) ||
    isVendorPublicPage(pathname) ||
    isAdminLoginPage(pathname) ||
    isSuperAdminLoginPage(pathname)
  ) {
    return passThrough(request, pathname);
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getVerifiedSession(cookieHeader);

  // /vendor and /seller routes
  if (
    isSellerRoute(pathname) &&
    !isSellerLoginPage(pathname) &&
    !isVendorPublicPage(pathname)
  ) {
    if (!session) return redirectToLogin(request, pathname, VENDOR_LOGIN);
    if (!SELLER_ROLES.includes(session.role))
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    return passThrough(request, pathname);
  }

  // /admin routes
  if (isAdminRoute(pathname) && !isAdminLoginPage(pathname)) {
    if (!session) return redirectToLogin(request, pathname, ADMIN_LOGIN);
    if (session.role !== ADMIN_ROLE)
      return NextResponse.redirect(new URL("/vendor", request.url));
    return passThrough(request, pathname);
  }

  // /superadmin routes (UI): session uses Bearer JWT in localStorage, not the main auth cookie.
  // A logged-in customer would otherwise hit session.role !== SUPER_ADMIN and get sent to /login.
  // API routes under /api/superadmin/* enforce requireSuperAdmin separately (middleware excludes /api).
  if (isSuperAdminRoute(pathname) && !isSuperAdminLoginPage(pathname)) {
    return passThrough(request, pathname);
  }

  // Customer-only authenticated routes (/profile, /cart, etc.)
  if (isAuthRequiredPath(pathname)) {
    if (!session) return redirectToLogin(request, pathname, LOGIN_PATH);
    return passThrough(request, pathname);
  }

  return passThrough(request, pathname);
}

/**
 * Forward the request and inject the current pathname as a request header so
 * server-component layouts can read it via headers().get("x-pathname").
 */
function passThrough(request: NextRequest, pathname: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function redirectToLogin(
  request: NextRequest,
  fromPath: string,
  loginPath: string
): NextResponse {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("callbackUrl", fromPath);
  return NextResponse.redirect(url);
}

/**
 * Match everything except Next.js internals, static assets, uploads, and API routes.
 * config.matcher must be defined inline (not re-exported) for Next.js static analysis.
 */
export const config = {
  matcher: [
    "/((?!_next/|favicon\\.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|woff2?|ttf|eot|pdf)$|api/).*)",
  ],
};
