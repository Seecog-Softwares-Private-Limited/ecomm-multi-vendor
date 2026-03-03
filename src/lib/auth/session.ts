import { NextRequest } from "next/server";
import { getTokenFromCookie, getTokenFromBearer } from "./cookies";
import { verifyToken } from "./jwt";
import type { JwtPayload } from "./jwt";
import { ApiRouteError, Status } from "@/lib/api";

/** Get token from cookie or from Authorization: Bearer <token> (for Postman/API clients). */
function getTokenFromRequest(request: NextRequest): string | null {
  const fromCookie = getTokenFromCookie(request.headers.get("cookie"));
  if (fromCookie) return fromCookie;
  return getTokenFromBearer(request.headers.get("authorization"));
}

/**
 * Verify the auth token from the request and return the session payload.
 * Use in API routes or middleware to protect endpoints and get current user/role.
 * Token is read from cookie (browser) or Authorization: Bearer <token> (e.g. Postman).
 *
 * @example
 * const session = await getSession(request);
 * if (!session) return apiUnauthorized();
 * if (session.role !== "ADMIN") return apiForbidden();
 */
export async function getSession(request: NextRequest): Promise<JwtPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require a session; returns payload or throws ApiRouteError(401).
 * Caught by withApiHandler so the client receives a proper 401 response.
 */
export async function requireSession(request: NextRequest): Promise<JwtPayload> {
  const session = await getSession(request);
  if (!session) {
    throw new ApiRouteError("Not authenticated", Status.UNAUTHORIZED, "UNAUTHORIZED");
  }
  return session;
}
