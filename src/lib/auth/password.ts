import bcrypt from "bcryptjs";
import { promisify } from "node:util";
import { authConfig } from "./config";

const hashAsync = promisify(bcrypt.hash) as (
  data: string,
  saltOrRounds: string | number
) => Promise<string>;
const compareAsync = promisify(bcrypt.compare) as (data: string, encrypted: string) => Promise<boolean>;

/**
 * Hash a plain password for storage. Uses bcrypt with configured salt rounds.
 * (bcryptjs is pure JS — same install works on Windows and Linux.)
 */
export async function hashPassword(plain: string): Promise<string> {
  return hashAsync(plain, authConfig.bcryptRounds);
}

/**
 * Verify a plain password against a stored hash. Constant-time comparison via bcrypt.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return compareAsync(plain, hash);
}
