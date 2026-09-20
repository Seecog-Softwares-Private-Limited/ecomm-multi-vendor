/**
 * Client helpers for Vendor auth onboarding UX.
 * Backend remains the source of truth.
 */

export type VendorAuthMe = {
  vendorId?: string;
  email?: string;
  ownerName?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  authOnboardingComplete?: boolean;
  needsAuthOnboarding?: boolean;
  oauthProvider?: string | null;
  appleUserId?: string | null;
  socialSignInOnly?: boolean;
};

export type VendorOnboardingStep =
  | "done"
  | "phone_otp"
  | "name_email"
  | "await_email_verification";

const PLACEHOLDER_SUFFIXES = [
  "@phone-otp.vendor.indovyapar.local",
  "@pending.vendor.indovyapar.local",
];

export function isPlaceholderVendorEmailClient(email: string | null | undefined): boolean {
  if (!email) return true;
  const lower = email.trim().toLowerCase();
  return PLACEHOLDER_SUFFIXES.some((s) => lower.endsWith(s));
}

export function vendorNeedsAuthOnboarding(v: VendorAuthMe | null | undefined): boolean {
  if (!v) return false;
  if (v.needsAuthOnboarding === true) return true;
  if (v.authOnboardingComplete === false) return true;
  if (v.authOnboardingComplete === true) return false;
  return false;
}

export function resolveVendorOnboardingStep(
  v: VendorAuthMe | null | undefined
): VendorOnboardingStep {
  if (!v) return "done";
  if (!vendorNeedsAuthOnboarding(v)) return "done";

  const phoneOk = v.phoneVerified === true && Boolean(v.phone?.trim());
  if (!phoneOk) return "phone_otp";

  const hasRealEmail =
    Boolean(v.email?.trim()) && !isPlaceholderVendorEmailClient(v.email);
  const hasName =
    Boolean(v.ownerName?.trim()) &&
    v.ownerName!.trim().toLowerCase() !== "pending";

  if (!hasRealEmail || !hasName) return "name_email";
  if (v.emailVerified !== true) return "await_email_verification";
  // Fields satisfied — refreshMe / syncSellerAuthOnboardingComplete will flip the flag.
  return "done";
}

export function isVendorAccountIncompleteApiError(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const err = (payload as { error?: unknown }).error;
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === "ACCOUNT_INCOMPLETE";
}

export const VENDOR_AUTH_ONBOARDING_PATH = "/vendor/complete-account";

/** Matches assertSellerAuthComplete / apiAccountIncomplete message. */
export const SELLER_ACCOUNT_INCOMPLETE_MESSAGE =
  "Complete your account setup to continue.";

export function redirectIfVendorAccountIncomplete(
  payload: unknown,
  navigate: (path: string) => void
): boolean {
  if (!isVendorAccountIncompleteApiError(payload)) return false;
  navigate(VENDOR_AUTH_ONBOARDING_PATH);
  return true;
}
