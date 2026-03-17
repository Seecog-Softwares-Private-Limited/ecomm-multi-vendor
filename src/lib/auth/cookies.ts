import { NextResponse } from "next/server";
import { authConfig } from "./config";

const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "")
  .trim()
  .toLowerCase();

const forceInsecure = process.env.AUTH_COOKIE_SECURE === "false";

// ✅ FINAL single cookieSecure logic
const cookieSecure =
  process.env.COOKIE_SECURE === "false"
    ? false
    : process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" &&
        appUrl.startsWith("https://"));

/**
 * Set the auth token in an HTTP-only cookie on the response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(authConfig.cookieName, token, {
    httpOnly: true,
    secure: cookieSecure, // 
    sameSite: "lax",
    maxAge: authConfig.cookieMaxAge,
    path: "/",
  });
}

/**
 * Clear the auth cookie.
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