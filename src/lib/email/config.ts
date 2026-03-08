/**
 * Email (SMTP) configuration from environment.
 * In development, use a test SMTP (e.g. Ethereal, Mailtrap, Brevo) or leave unset to skip sending.
 */
function getEnv(key: string, required = false): string {
  const value = (process.env[key] ?? "").trim();
  if (required && process.env.NODE_ENV === "production" && !value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

/** SMTP host: use SMTP_HOST (fallback to common typo SWMTP_HOST). */
function getSmtpHost(): string {
  return (getEnv("SMTP_HOST") || getEnv("SWMTP_HOST")).trim();
}

export const emailConfig = {
  /** SMTP host (e.g. smtp-relay.brevo.com, smtp.gmail.com, smtp.mailtrap.io) */
  get host(): string {
    return getSmtpHost();
  },
  /** SMTP port (e.g. 587, 465) */
  port: parseInt(getEnv("SMTP_PORT") || "587", 10) || 587,
  /** SMTP user (optional for some servers) */
  user: getEnv("SMTP_USER"),
  /** SMTP password */
  pass: getEnv("SMTP_PASS"),
  /** From address (e.g. noreply@yourdomain.com). Defaults to user if not set. */
  get from(): string {
    return getEnv("SMTP_FROM") || getEnv("SMTP_USER") || "noreply@localhost";
  },
  /** Base URL for links in emails. Set APP_URL or PORT in .env / properties.env. */
  get appUrl(): string {
    const url = getEnv("APP_URL");
    if (url) return url;
    const port = getEnv("PORT");
    return port ? `http://localhost:${port}` : "";
  },
  /** If true, email sending is enabled. Requires host and (pass or no user). */
  get enabled(): boolean {
    const host = getSmtpHost();
    const pass = getEnv("SMTP_PASS");
    const user = getEnv("SMTP_USER");
    return Boolean(host && (pass || !user));
  },
} as const;
