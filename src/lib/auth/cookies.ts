import { NextResponse } from "next/server";
import { authConfig } from "./config";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "")
  .trim()
  .toLowerCase();

// ✅ FINAL single cookieSecure logic
const cookieSecure =
  process.env.COOKIE_SECURE === "false"
    ? false
    : process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" &&
        appUrl.startsWith("https://"));

/** Share auth cookie across apex + www so Customer/Vendor WebViews both see the session. */
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

/**
 * Set the auth token in an HTTP-only cookie on the response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  const domain = authCookieDomain();
  response.cookies.set(authConfig.cookieName, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    maxAge: authConfig.cookieMaxAge,
    path: "/",
    ...(domain ? { domain } : {}),
  });
}

/**
 * Clear the auth cookie.
 */
export function clearAuthCookie(response: NextResponse): void {
  const domain = authCookieDomain();
  response.cookies.set(authConfig.cookieName, "", {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    ...(domain ? { domain } : {}),
  });
}

/**
 * Read token from cookie
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key?.trim(), v.join("=").trim()];
    })
  );

  const value = cookies[authConfig.cookieName];
  return value && value.length > 0 ? value : null;
}
