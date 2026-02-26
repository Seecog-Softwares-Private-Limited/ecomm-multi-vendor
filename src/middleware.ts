import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getVerifiedSession } from "@/lib/auth/middleware-auth";
import {
  isAuthPage,
  isAuthRequiredPath,
  isSellerRoute,
  isAdminRoute,
  isSellerLoginPage,
  isVendorLoginPage,
  isAdminLoginPage,
  SELLER_ROLES,
  ADMIN_ROLE,
  VENDOR_LOGIN,
  ADMIN_LOGIN,
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

  // Allow auth pages (login, register, etc.) and static/API
  if (
    isAuthPage(pathname) ||
    isSellerLoginPage(pathname) ||
    isVendorLoginPage(pathname) ||
    isAdminLoginPage(pathname)
  ) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getVerifiedSession(cookieHeader);

  // --- Role-based: seller routes (/vendor, /seller except login) ---
  if (
    isSellerRoute(pathname) &&
    !isSellerLoginPage(pathname) &&
    !isVendorLoginPage(pathname)
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
     * Match all pathnames except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
