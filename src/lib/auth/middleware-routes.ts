/**
 * Route protection config for middleware.
 * Centralized path patterns and role requirements.
 */

import type { AuthRole } from "./config";

/** Paths that require any authenticated user (customer, seller, admin). */
export const AUTH_REQUIRED_PATHS = [
  "/profile",
  "/my-orders",
  "/cart",
  "/checkout",
  "/wishlist",
  "/address-management",
  "/add-address",
  "/support-tickets",
  "/order-confirmation",
] as const;

/** Path prefix that requires SELLER or ADMIN. */
export const SELLER_PREFIX = "/vendor";

/** Path prefix for seller dashboard (alias). */
export const SELLER_ALT_PREFIX = "/seller";

/** Path prefix that requires ADMIN. */
export const ADMIN_PREFIX = "/admin";

/** Paths that are auth pages (no redirect when already logged in). */
export const AUTH_PAGES = [
  "/login",
  "/register",
  "/verify-email",
  "/verify_email",
  "/forgot-password",
  "/reset-password",
  "/otp-verification",
] as const;

/** Paths that are login pages per role (used to redirect after role check). */
export const SELLER_LOGIN = "/seller/login";
/** Vendor dashboard login — use this for /vendor/* redirects. */
export const VENDOR_LOGIN = "/vendor/login";

/** Vendor auth pages that don't require session (login, register, forgot/reset password). */
export function isVendorPublicPage(pathname: string): boolean {
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
export const ADMIN_LOGIN = "/admin/login";

/** Roles that can access seller routes. */
export const SELLER_ROLES: AuthRole[] = ["SELLER", "ADMIN"];

/** Role that can access admin routes. */
export const ADMIN_ROLE: AuthRole = "ADMIN";

/** Normalize pathname for comparisons (trailing slash, except root). */
function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isAuthPage(pathname: string): boolean {
  const p = normalizePath(pathname);
  return (AUTH_PAGES as readonly string[]).includes(p);
}

export function isSellerRoute(pathname: string): boolean {
  return pathname === SELLER_PREFIX || pathname.startsWith(SELLER_PREFIX + "/") ||
    pathname === SELLER_ALT_PREFIX || pathname.startsWith(SELLER_ALT_PREFIX + "/");
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");
}

/** Seller login path under /seller — don't require role for that path. */
export function isSellerLoginPage(pathname: string): boolean {
  return pathname === SELLER_LOGIN;
}

/** Vendor login path under /vendor — don't require role for that path. */
export function isVendorLoginPage(pathname: string): boolean {
  return pathname === VENDOR_LOGIN;
}

export function isAdminLoginPage(pathname: string): boolean {
  return pathname === ADMIN_LOGIN;
}

export function isAuthRequiredPath(pathname: string): boolean {
  return (AUTH_REQUIRED_PATHS as readonly string[]).some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function requiresAuth(pathname: string): boolean {
  return isAuthRequiredPath(pathname) || isSellerRoute(pathname) || isAdminRoute(pathname);
}
