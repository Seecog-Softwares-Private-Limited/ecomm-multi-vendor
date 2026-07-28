const NEW_PASSWORD_MIN = 8;
const NEW_PASSWORD_MAX = 128;
const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_NUMBER = /\d/;

/** Password rules for admin / super-admin accounts (change + reset). */
export function validateAdminNewPassword(password: string): string | null {
  if (password.length < NEW_PASSWORD_MIN) return "Password must be at least 8 characters";
  if (password.length > NEW_PASSWORD_MAX) return "Password too long";
  if (!HAS_UPPER.test(password)) return "Password must contain at least one uppercase letter";
  if (!HAS_LOWER.test(password)) return "Password must contain at least one lowercase letter";
  if (!HAS_NUMBER.test(password)) return "Password must contain at least one number";
  return null;
}
