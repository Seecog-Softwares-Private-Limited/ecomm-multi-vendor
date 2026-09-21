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
 *
 * Deletes both:
 * - the shared Domain=.indovyapar.com cookie (current production), and
 * - any legacy host-only cookie (no Domain) from before Domain was added.
 *
 * NextResponse.cookies is keyed by cookie name, so the Domain deletion is
 * appended as a second Set-Cookie header when a shared domain is configured.
 */
export function clearAuthCookie(response: NextResponse): void {
  const clearOpts = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };

  // B. Legacy host-only cookie — omit Domain so it matches pre-Domain jars.
  response.cookies.set(authConfig.cookieName, "", clearOpts);

  // A. Shared-domain cookie (when APP_URL maps to .indovyapar.com).
  const domain = authCookieDomain();
  if (domain) {
    const parts = [
      `${authConfig.cookieName}=`,
      "Path=/",
      "Max-Age=0",
      `Domain=${domain}`,
      ...(cookieSecure ? (["Secure"] as const) : []),
      "HttpOnly",
      "SameSite=Lax",
    ];
    response.headers.append("Set-Cookie", parts.join("; "));
  }
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
