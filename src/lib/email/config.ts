/**
 * Email (SMTP) configuration from environment.
 * In development, use a test SMTP (e.g. Ethereal, Mailtrap) or leave unset to skip sending.
 */
function getEnv(key: string, required = false): string {
  const value = process.env[key] ?? "";
  if (required && process.env.NODE_ENV === "production" && !value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

export const emailConfig = {
  /** SMTP host (e.g. smtp.gmail.com, smtp.mailtrap.io) */
  host: getEnv("SMTP_HOST"),
  /** SMTP port (e.g. 587, 465) */
  port: parseInt(getEnv("SMTP_PORT") || "587", 10) || 587,
  /** SMTP user (optional for some servers) */
  user: getEnv("SMTP_USER"),
  /** SMTP password */
  pass: getEnv("SMTP_PASS"),
  /** From address (e.g. noreply@yourdomain.com). Defaults to user if not set. */
  from: getEnv("SMTP_FROM") || getEnv("SMTP_USER") || "noreply@localhost",
  /** Base URL for links in emails (e.g. https://yourdomain.com, http://localhost:3000) */
  appUrl: getEnv("APP_URL") || "http://localhost:3000",
  /** If true, email sending is enabled. When false, mail is logged only (useful for dev without SMTP). */
  get enabled(): boolean {
    return Boolean(this.host && (this.pass || !this.user));
  },
} as const;
