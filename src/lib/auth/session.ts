import { NextRequest } from "next/server";
import { getTokenFromCookie } from "./cookies";
import { verifyToken } from "./jwt";
import type { JwtPayload } from "./jwt";
import { ApiRouteError, Status } from "@/lib/api";

/**
 * Verify the auth token from the request and return the session payload.
 * Use in API routes or middleware to protect endpoints and get current user/role.
 *
 * @example
 * const session = await getSession(request);
 * if (!session) return apiUnauthorized();
 * if (session.role !== "ADMIN") return apiForbidden();
 */
export async function getSession(request: NextRequest): Promise<JwtPayload | null> {
  const token = getTokenFromCookie(request.headers.get("cookie"));
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
