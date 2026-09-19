/**
 * Client-side helpers for Customer onboarding UX (Phase 5).
 * Backend remains the source of truth — these only interpret API payloads.
 */

export type CustomerAuthMeUser = {
  id?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  oauthProvider?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  profileCompleted?: boolean;
  authOnboardingComplete?: boolean;
  needsAuthOnboarding?: boolean;
  needsProfileCompletion?: boolean;
};

export type CustomerOnboardingStep =
  | "done"
  | "phone_otp"
  | "name_email"
  | "await_email_verification";

const PLACEHOLDER_EMAIL_SUFFIXES = [
  "@phone-otp.indovyapar.local",
  "@pending.indovyapar.local",
];

export function isPlaceholderCustomerEmailClient(email: string | null | undefined): boolean {
  if (!email) return true;
  const lower = email.trim().toLowerCase();
  return PLACEHOLDER_EMAIL_SUFFIXES.some((s) => lower.endsWith(s));
}

/** Prefer backend flags; fall back to legacy needsProfileCompletion only when flags are absent. */
export function customerNeedsAuthOnboarding(user: CustomerAuthMeUser | null | undefined): boolean {
  if (!user) return false;
  if (user.needsAuthOnboarding === true) return true;
  if (user.authOnboardingComplete === false) return true;
  // Explicit complete — never force onboarding via legacy profileCompleted flag.
  if (user.authOnboardingComplete === true) return false;
  return user.needsProfileCompletion === true;
}

/**
 * Decide which onboarding UI to show from /api/auth/me fields.
 * Does not re-implement completion rules — only maps UX steps.
 */
export function resolveCustomerOnboardingStep(
  user: CustomerAuthMeUser | null | undefined
): CustomerOnboardingStep {
  if (!user) return "done";
  if (!customerNeedsAuthOnboarding(user)) return "done";

  const phoneVerified = user.phoneVerified === true && Boolean(user.phone?.trim());
  if (!phoneVerified) return "phone_otp";

  const hasRealEmail =
    Boolean(user.email?.trim()) && !isPlaceholderCustomerEmailClient(user.email);
  const hasName = Boolean(user.firstName?.trim() || user.lastName?.trim());

  if (!hasRealEmail || !hasName) return "name_email";

  if (user.emailVerified !== true) return "await_email_verification";

  // Backend still says incomplete — keep onboarding until me refreshes to complete.
  return "name_email";
}

/** True when API JSON indicates ACCOUNT_INCOMPLETE (not other 403s). */
export function isAccountIncompleteApiError(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const err = (payload as { error?: unknown }).error;
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  if (code === "ACCOUNT_INCOMPLETE") return true;
  const details = (err as { details?: unknown }).details;
  if (
    details &&
    typeof details === "object" &&
    (details as { needsAuthOnboarding?: unknown }).needsAuthOnboarding === true &&
    code === "ACCOUNT_INCOMPLETE"
  ) {
    return true;
  }
  return false;
}

export const CUSTOMER_ONBOARDING_PATH = "/complete-profile";

/**
 * If the response body is ACCOUNT_INCOMPLETE, navigate to onboarding.
 * Returns true when a redirect was triggered.
 */
export function redirectIfAccountIncomplete(
  payload: unknown,
  navigate: (path: string) => void
): boolean {
  if (!isAccountIncompleteApiError(payload)) return false;
  navigate(CUSTOMER_ONBOARDING_PATH);
  return true;
}

/**
 * Fetch wrapper that redirects only on ACCOUNT_INCOMPLETE (not other 403s).
 * Returns parsed JSON body; throws on other error statuses.
 */
export async function customerApiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ res: Response; data: unknown }> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (typeof window !== "undefined" && isAccountIncompleteApiError(data)) {
    window.location.assign(CUSTOMER_ONBOARDING_PATH);
    throw new Error(
      (data as { error?: { message?: string } })?.error?.message ??
        "Complete your account setup to continue."
    );
  }
  return { res, data };
}
