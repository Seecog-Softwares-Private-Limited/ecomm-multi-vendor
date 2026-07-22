import { hasNativeBridge, postToNative } from "@/lib/native-bridge";

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
 * Starts Google or Facebook OAuth from the login/register pages.
 * Uses the native bridge in the mobile app WebView when available; always
 * performs a full-page navigation so regular browsers are not left on a noop.
 */
export function startOAuthLogin(provider: SocialOAuthProvider, returnUrl = "/"): void {
  if (typeof window === "undefined") return;

  const href = new URL(
    buildOAuthStartPath(provider, returnUrl),
    window.location.origin
  ).toString();

  if (hasNativeBridge()) {
    postToNative({
      type: "custom",
      name: "OPEN_EXTERNAL_BROWSER",
      payload: href,
    });
  }

  window.location.assign(href);
}

/** Google sign-in for vendor (Seller) accounts at /vendor/login */
export function startVendorOAuthLogin(
  provider: SocialOAuthProvider,
  returnUrl = "/vendor"
): void {
  if (typeof window === "undefined") return;

  const href = new URL(
    buildVendorOAuthStartPath(provider, returnUrl),
    window.location.origin
  ).toString();

  if (hasNativeBridge()) {
    postToNative({
      type: "custom",
      name: "OPEN_EXTERNAL_BROWSER",
      payload: href,
    });
  }

  window.location.assign(href);
}
