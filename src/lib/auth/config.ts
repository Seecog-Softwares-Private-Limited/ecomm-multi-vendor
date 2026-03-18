/**
 * Auth configuration. All secrets from env; fail fast if missing in production.
 * In development, set JWT_SECRET in .env for sign/verify to work (e.g. openssl rand -base64 32).
 */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required env: ${key}`);
  }
  return value ?? "";
};

export const authConfig = {
  /** JWT signing/verification secret. Min 32 chars in production. */
  jwtSecret: required("JWT_SECRET"),
  /** Token expiry (e.g. "7d", "24h"). */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  /** HTTP-only cookie name for the token. */
  cookieName: process.env.AUTH_COOKIE_NAME ?? "auth_token",
  /** Cookie max-age in seconds (should match or exceed JWT expiry). */
  cookieMaxAge: 60 * 60 * 24 * 7, // 7 days
  /** bcrypt salt rounds (10–12 recommended). */
  bcryptRounds: 12,
} as const;

/** Role claim in JWT. Align with Prisma UserRole when used. SUPER_ADMIN for Super Admin panel. */
export type AuthRole = "CUSTOMER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
