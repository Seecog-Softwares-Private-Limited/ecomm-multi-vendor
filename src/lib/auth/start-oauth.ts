import { canUseNativeAppleSignIn, postToNative } from "@/lib/native-bridge";

export const SIGN_IN_WITH_APPLE_MESSAGE = "SIGN_IN_WITH_APPLE";
export const APPLE_AUTH_RESULT_MESSAGE = "APPLE_AUTH_RESULT";

export type SocialOAuthProvider = "google" | "facebook";

/** Set to true when Facebook OAuth is ready to ship. */
export const FACEBOOK_SIGN_IN_ENABLED = false;

export function buildOAuthStartPath(
  provider: SocialOAuthProvider,
  returnUrl = "/"
): string {
  return `/api/auth/oauth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`;
}

export function buildVendorOAuthStartPath(
  provider: SocialOAuthProvider,
  returnUrl = "/vendor"
): string {
  return `/api/auth/vendor-oauth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`;
}

/**
 * Starts Google or Facebook OAuth from the customer login/register pages.
 * Always stays in the same WebView / browser tab (no system Safari handoff).
 * Opening Safari for OAuth fails App Store Guideline 4 for hybrid apps.
 */
export function startOAuthLogin(provider: SocialOAuthProvider, returnUrl = "/"): void {
  if (typeof window === "undefined") return;

  const href = new URL(
    buildOAuthStartPath(provider, returnUrl),
    window.location.origin
  ).toString();

  window.location.assign(href);
}

/**
 * Google sign-in for vendor (Seller) accounts at /vendor/login.
 * Always stays in the same WebView / browser tab (no system Safari handoff).
 * Required for App Store Guideline 4 — auth must complete in-app.
 */
export function startVendorOAuthLogin(
  provider: SocialOAuthProvider,
  returnUrl = "/vendor"
): void {
  if (typeof window === "undefined") return;

  const href = new URL(
    buildVendorOAuthStartPath(provider, returnUrl),
    window.location.origin
  );
  // Preserve hybrid-app context through the Google round-trip.
  try {
    const current = new URL(window.location.href);
    if (current.searchParams.get("app") || window.__INDOVYAPAR_NATIVE__) {
      href.searchParams.set("app", current.searchParams.get("app") || "1");
    }
    if (current.searchParams.get("v")) {
      href.searchParams.set("v", current.searchParams.get("v")!);
    }
  } catch {
    /* ignore */
  }

  window.location.assign(href.toString());
}

/**
 * Starts native Sign in with Apple from /vendor/login inside the iOS WebView.
 * Returns false when native Apple Sign In is unavailable (browser / Android).
 */
export function startVendorAppleLogin(returnUrl = "/vendor"): boolean {
  if (typeof window === "undefined") return false;
  if (!canUseNativeAppleSignIn()) return false;

  return postToNative({
    type: "custom",
    name: SIGN_IN_WITH_APPLE_MESSAGE,
    payload: { returnUrl },
  });
}
