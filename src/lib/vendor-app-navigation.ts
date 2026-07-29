/**
 * Native-style navigation for the vendor hybrid app (Expo WebView + Next.js).
 *
 * Root tabs replace history so sibling sections (Orders, Products, …) are not
 * reachable via Back after returning to Dashboard. Detail routes still push.
 */

export const VENDOR_DASHBOARD_PATH = "/vendor";

/** Primary destinations — switching between these should not stack browser history. */
const VENDOR_ROOT_TAB_PREFIXES = [
  "/vendor/orders",
  "/vendor/products",
  "/vendor/earnings",
  "/vendor/payouts",
  "/vendor/reports",
  "/vendor/profile",
  "/vendor/support",
  "/vendor/settings",
  "/vendor/notifications",
  "/vendor/status",
  "/vendor/gatekeeping",
  "/vendor/guidelines",
  "/vendor/delivery-areas",
] as const;

export function normalizeVendorPathname(pathname: string): string {
  if (!pathname) return VENDOR_DASHBOARD_PATH;
  const base = pathname.split("?")[0] ?? pathname;
  if (base.length > 1 && base.endsWith("/")) return base.slice(0, -1);
  return base || VENDOR_DASHBOARD_PATH;
}

export function isVendorDashboardPath(pathname: string): boolean {
  return normalizeVendorPathname(pathname) === VENDOR_DASHBOARD_PATH;
}

export function isVendorRootTabPath(pathname: string): boolean {
  const normalized = normalizeVendorPathname(pathname);
  if (normalized === VENDOR_DASHBOARD_PATH) return true;
  return VENDOR_ROOT_TAB_PREFIXES.some((prefix) => normalized === prefix);
}

/** Routes that form a sub-stack (detail → list → dashboard). */
export function isVendorStackedRoute(pathname: string): boolean {
  const normalized = normalizeVendorPathname(pathname);
  const parts = normalized.split("/").filter(Boolean);
  if (parts[0] !== "vendor") return false;
  if (parts.length <= 2) return false;

  const section = parts[1];
  if (section === "orders") return parts.length >= 3;
  if (section === "products") {
    return parts[2] === "create" || (parts[2] === "edit" && parts.length >= 4);
  }
  if (section === "verify") return parts.length >= 3;

  return parts.length >= 3;
}

/**
 * In hybrid app mode, root tab links replace history; detail flows push.
 * Auth and external paths keep default push semantics.
 */
export function vendorNavigateTargetMode(href: string): "replace" | "push" {
  const pathname = normalizeVendorPathname(href.split("?")[0] ?? href);
  if (!pathname.startsWith("/vendor")) return "push";
  if (
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password")
  ) {
    return "push";
  }
  if (isVendorStackedRoute(pathname)) return "push";
  return "replace";
}

export function hasVendorHistoryOverlayState(): boolean {
  if (typeof window === "undefined") return false;
  const state = window.history.state as Record<string, unknown> | null;
  return Boolean(state?.vendorUi || state?.vendorDocPreview);
}

declare global {
  interface Window {
    __INDOVYAPAR_VENDOR_HANDLE_BACK__?: () => void;
  }
}
