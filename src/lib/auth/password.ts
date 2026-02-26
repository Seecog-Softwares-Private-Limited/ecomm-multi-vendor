import bcrypt from "bcrypt";
import { authConfig } from "./config";

/**
 * Hash a plain password for storage. Uses bcrypt with configured salt rounds.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, authConfig.bcryptRounds);
}

/**
 * Verify a plain password against a stored hash. Constant-time comparison via bcrypt.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
