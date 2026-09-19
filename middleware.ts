import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applyApiCors, apiCorsPreflight } from "@/lib/api/cors";
import { getVerifiedSession } from "@/lib/auth/middleware-auth";
import { copyVendorAppContextParams } from "@/lib/vendor-app-query";
import {
  isAuthPage,
  isAuthRequiredPath,
  isCustomerOnboardingPage,
  isSellerRoute,
  isAdminRoute,
  isSuperAdminRoute,
  isSellerLoginPage,
  isVendorLoginPage,
  isVendorPublicPage,
  isVendorAuthOnboardingPage,
  isAdminLoginPage,
  isSuperAdminLoginPage,
  SELLER_ROLES,
  ADMIN_ROLE,
  VENDOR_LOGIN,
  ADMIN_LOGIN,
  CUSTOMER_ONBOARDING_PATH,
  VENDOR_AUTH_ONBOARDING_PATH,
} from "@/lib/auth/middleware-routes";

const LOGIN_PATH = "/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS for Flutter/mobile clients calling /api/* from another origin (e.g. Flutter web).
  // API authorization (including ACCOUNT_INCOMPLETE) is enforced in route handlers — not here.
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return apiCorsPreflight(request);
    }
    return applyApiCors(NextResponse.next(), request);
  }

  // Fix typo: /login/admin/login → /admin/login
  if (pathname === "/login/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Pass through public auth + onboarding pages without completeness redirect
  if (
    isAuthPage(pathname) ||
    isSellerLoginPage(pathname) ||
    isVendorLoginPage(pathname) ||
    (isVendorPublicPage(pathname) && !isVendorAuthOnboardingPage(pathname)) ||
    isAdminLoginPage(pathname) ||
    isSuperAdminLoginPage(pathname)
  ) {
    // Onboarding pages still require a session when they are auth-gated below.
    if (!isCustomerOnboardingPage(pathname)) {
      return passThrough(request, pathname);
    }
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getVerifiedSession(cookieHeader);

  // /complete-profile — allow authenticated customers (complete or incomplete) without loop
  if (isCustomerOnboardingPage(pathname)) {
    if (!session) return redirectToLogin(request, pathname, LOGIN_PATH);
    return passThrough(request, pathname);
  }

  // /vendor/complete-account — allow authenticated incomplete sellers without loop
  if (isVendorAuthOnboardingPage(pathname)) {
    if (!session) return redirectToLogin(request, pathname, VENDOR_LOGIN);
    if (session.role !== "SELLER") {
      return redirectToLogin(request, pathname, VENDOR_LOGIN);
    }
    // Complete sellers leave onboarding
    const incomplete = await isSellerAuthIncomplete(request);
    if (!incomplete) {
      const url = new URL("/vendor", request.url);
      copyVendorAppContextParams(request.nextUrl.searchParams, url.searchParams);
      return NextResponse.redirect(url);
    }
    return passThrough(request, pathname);
  }

  // /vendor and /seller routes
  if (
    isSellerRoute(pathname) &&
    !isSellerLoginPage(pathname) &&
    !isVendorPublicPage(pathname)
  ) {
    if (!session) return redirectToLogin(request, pathname, VENDOR_LOGIN);
    if (!SELLER_ROLES.includes(session.role)) {
      const url = new URL(VENDOR_LOGIN, request.url);
      url.searchParams.set(
        "error",
        "Please sign in with a vendor account."
      );
      copyVendorAppContextParams(request.nextUrl.searchParams, url.searchParams);
      return NextResponse.redirect(url);
    }

    // Incomplete vendors must finish auth onboarding before the vendor app.
    if (session.role === "SELLER" && !isVendorAuthOnboardingPage(pathname)) {
      const incomplete = await isSellerAuthIncomplete(request);
      if (incomplete) {
        const url = new URL(VENDOR_AUTH_ONBOARDING_PATH, request.url);
        url.searchParams.set("callbackUrl", pathname);
        copyVendorAppContextParams(request.nextUrl.searchParams, url.searchParams);
        return NextResponse.redirect(url);
      }
    }

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

    // Phase 4: incomplete Customers cannot use commerce pages until onboarding finishes.
    // DB is authoritative — Edge middleware asks GET /api/auth/me (allowlisted).
    if (session.role === "CUSTOMER") {
      const incomplete = await isCustomerAuthIncomplete(request);
      if (incomplete) {
        const url = new URL(CUSTOMER_ONBOARDING_PATH, request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    return passThrough(request, pathname);
  }

  return passThrough(request, pathname);
}

/**
 * Ask the allowlisted vendor session endpoint whether auth onboarding is incomplete.
 * Fail open if /me is unreachable — APIs still enforce the gate.
 */
async function isSellerAuthIncomplete(request: NextRequest): Promise<boolean> {
  try {
    const meUrl = new URL("/api/vendor/me", request.nextUrl.origin);
    const headers: HeadersInit = {
      cookie: request.headers.get("cookie") ?? "",
    };
    const authorization = request.headers.get("authorization");
    if (authorization) headers.authorization = authorization;

    const res = await fetch(meUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json()) as {
      data?: {
        authOnboardingComplete?: boolean;
        needsAuthOnboarding?: boolean;
      } | null;
    };
    const data = json?.data;
    if (!data) return false;
    if (data.authOnboardingComplete === false) return true;
    if (data.needsAuthOnboarding === true) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Ask the allowlisted session endpoint whether onboarding is incomplete.
 * Fail open (allow page) if /me is unreachable — APIs still enforce the gate.
 */
async function isCustomerAuthIncomplete(request: NextRequest): Promise<boolean> {
  try {
    const meUrl = new URL("/api/auth/me", request.nextUrl.origin);
    const headers: HeadersInit = {
      cookie: request.headers.get("cookie") ?? "",
    };
    const authorization = request.headers.get("authorization");
    if (authorization) headers.authorization = authorization;

    const res = await fetch(meUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json()) as {
      data?: { user?: { authOnboardingComplete?: boolean; needsAuthOnboarding?: boolean } | null };
    };
    const user = json?.data?.user;
    if (!user) return false;
    if (user.authOnboardingComplete === false) return true;
    if (user.needsAuthOnboarding === true) return true;
    return false;
  } catch {
    return false;
  }
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
  copyVendorAppContextParams(request.nextUrl.searchParams, url.searchParams);
  return NextResponse.redirect(url);
}

/**
 * Match everything except Next.js internals, static assets, uploads, and API routes.
 * config.matcher must be defined inline (not re-exported) for Next.js static analysis.
 */
export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/|favicon\\.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|woff2?|ttf|eot|pdf)$|api/).*)",
  ],
};
