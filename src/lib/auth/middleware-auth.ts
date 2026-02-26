/**
 * Auth helpers for Next.js middleware (Edge runtime).
 * Uses only jose + config; do not import session/cookies/password to keep Edge-safe.
 */

import { verifyToken } from "./jwt";
import type { JwtPayload } from "./jwt";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "auth_token";

/**
 * Read auth token from NextRequest cookies and verify JWT.
 * Returns payload or null if missing/invalid/expired.
 */
export async function getVerifiedSession(
  cookieHeader: string | null
): Promise<JwtPayload | null> {
  if (!cookieHeader) return null;
  const token = parseCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;
  return verifyToken(token);
}

function parseCookie(header: string, name: string): string | null {
  const cookies = header.split(";").map((s) => s.trim());
  for (const c of cookies) {
    const eq = c.indexOf("=");
    if (eq === -1) continue;
    const key = c.slice(0, eq).trim();
    if (key === name) {
      const value = c.slice(eq + 1).trim();
      return value.length > 0 ? value : null;
    }
  }
  return null;
}
