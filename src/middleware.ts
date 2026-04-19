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
  SUPER_ADMIN_ROLE,
  VENDOR_LOGIN,
  ADMIN_LOGIN,
  SUPER_ADMIN_LOGIN,
} from "@/lib/auth/middleware-routes";

const LOGIN_PATH = "/login";

/**
 * Route protection middleware.
 * - Validates JWT from HTTP-only cookie.
 * - Protects authenticated routes (profile, cart, etc.).
 * - Protects role-based routes (seller: /vendor, /seller; admin: /admin).
 * - Redirects unauthorized users to login with callbackUrl.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Typo / relative link: from /login, "admin/login" resolves to /login/admin/login — fix to real route
  if (pathname === "/login/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Allow auth pages (login, register, forgot-password, reset-password, etc.)
  if (
    isAuthPage(pathname) ||
    isSellerLoginPage(pathname) ||
    isVendorLoginPage(pathname) ||
    isVendorPublicPage(pathname) ||
    isAdminLoginPage(pathname) ||
    isSuperAdminLoginPage(pathname)
  ) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getVerifiedSession(cookieHeader);

  // --- Role-based: seller routes (/vendor, /seller except public auth pages) ---
  if (
    isSellerRoute(pathname) &&
    !isSellerLoginPage(pathname) &&
    !isVendorPublicPage(pathname)
  ) {
    if (!session) {
      return redirectToLogin(request, pathname, VENDOR_LOGIN);
    }
    if (!SELLER_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  // --- Role-based: admin routes (/admin except login) ---
  if (isAdminRoute(pathname) && !isAdminLoginPage(pathname)) {
    if (!session) {
      return redirectToLogin(request, pathname, ADMIN_LOGIN);
    }
    if (session.role !== ADMIN_ROLE) {
      return NextResponse.redirect(new URL("/vendor", request.url));
    }
    return NextResponse.next();
  }

  // --- Role-based: superadmin routes (/superadmin except login) ---
  if (isSuperAdminRoute(pathname) && !isSuperAdminLoginPage(pathname)) {
    if (!session) {
      return redirectToLogin(request, pathname, SUPER_ADMIN_LOGIN);
    }
    if (session.role !== SUPER_ADMIN_ROLE) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // --- Authenticated routes (any logged-in user) ---
  if (isAuthRequiredPath(pathname)) {
    if (!session) {
      return redirectToLogin(request, pathname, LOGIN_PATH);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
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

export const config = {
  matcher: [
    /*
     * Never run auth on Next internals (_next/*), static assets, uploads, or API.
     * Excluding all of /_next/ avoids dev/HMR and RSC requests touching middleware.
     */
    "/((?!_next/|favicon\\.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|woff2?|ttf|eot|pdf)$|api/).*)",
  ],
};
