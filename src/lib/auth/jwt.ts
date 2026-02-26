import * as jose from "jose";
import { authConfig } from "./config";
import type { AuthRole } from "./config";

export interface JwtPayload {
  sub: string;
  email: string;
  role: AuthRole;
  iat?: number;
  exp?: number;
}

const encoder = new TextEncoder();

/**
 * Sign a JWT with user identity and role. Use for login/register.
 */
export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  if (!authConfig.jwtSecret || authConfig.jwtSecret.length === 0) {
    throw new Error("JWT_SECRET is not set; cannot sign token");
  }
  const secret = encoder.encode(authConfig.jwtSecret);
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(authConfig.jwtExpiresIn)
    .sign(secret);
}

function isJwtPayload(p: unknown): p is JwtPayload {
  return (
    typeof p === "object" &&
    p !== null &&
    typeof (p as JwtPayload).sub === "string" &&
    typeof (p as JwtPayload).email === "string" &&
    typeof (p as JwtPayload).role === "string" &&
    ["CUSTOMER", "SELLER", "ADMIN"].includes((p as JwtPayload).role)
  );
}

/**
 * Verify and decode a JWT. Returns payload or null if invalid/expired/malformed.
 * Use for cookie verification and protected routes.
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  if (!authConfig.jwtSecret || authConfig.jwtSecret.length === 0) return null;
  try {
    const secret = encoder.encode(authConfig.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return isJwtPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}
