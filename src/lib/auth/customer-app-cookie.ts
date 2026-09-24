/**
 * Customer App environment cookie (Flutter WebView only).
 *
 * Environment indicator — NOT authentication. Anyone can call the set endpoint;
 * real auth remains auth_token / JWT. Used only to apply App-specific UX rules
 * (e.g. phone optional until order).
 */

import { NextRequest, NextResponse } from "next/server";

export const CUSTOMER_APP_COOKIE_NAME = "indovyapar_customer_app";
export const CUSTOMER_APP_COOKIE_VALUE = "1";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "")
  .trim()
  .toLowerCase();

const cookieSecure =
  process.env.COOKIE_SECURE === "false"
    ? false
    : process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" &&
        appUrl.startsWith("https://"));

function authCookieDomain(): string | undefined {
  try {
    const raw = appUrl.includes("://") ? appUrl : appUrl ? `https://${appUrl}` : "";
    if (!raw) return undefined;
    const host = new URL(raw).hostname.toLowerCase();
    if (host === "indovyapar.com" || host === "www.indovyapar.com") {
      return ".indovyapar.com";
    }
    if (host.endsWith(".indovyapar.com")) return ".indovyapar.com";
  } catch {
    /* ignore */
  }
  return undefined;
}

/** True when the request carries the Customer App environment cookie. */
export function isCustomerAppRequest(request: NextRequest): boolean {
  return request.cookies.get(CUSTOMER_APP_COOKIE_NAME)?.value === CUSTOMER_APP_COOKIE_VALUE;
}

/** Set HttpOnly Customer App marker (same policy shape as auth_token). */
export function setCustomerAppCookie(response: NextResponse): void {
  const domain = authCookieDomain();
  response.cookies.set(CUSTOMER_APP_COOKIE_NAME, CUSTOMER_APP_COOKIE_VALUE, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year — app shell re-establishes on launch
    path: "/",
    ...(domain ? { domain } : {}),
  });
}
