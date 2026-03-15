import { NextResponse } from "next/server";
import { authConfig } from "./config";

/** Use Secure cookie only when on HTTPS. Set COOKIE_SECURE=false in .env for HTTP production. */
const cookieSecure =
  process.env.COOKIE_SECURE === "false"
    ? false
    : process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" && process.env.APP_URL?.startsWith("https://"));

/**
 * Set the auth token in an HTTP-only cookie on the response.
 * Call after successful login/register, then return the response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(authConfig.cookieName, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    maxAge: authConfig.cookieMaxAge,
    path: "/",
  });
}

/**
 * Clear the auth cookie. Call in logout handler.
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(authConfig.cookieName, "", {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Read the auth token from the request cookie header.
 * Returns null if missing or empty.
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
