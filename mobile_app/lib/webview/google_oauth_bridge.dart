/// Google OAuth handling notes for the Customer WebView app.
///
/// The Customer Website owns Google Sign-In. This file documents the
/// WebView-side strategy; there is no separate Flutter Google login UI.
///
/// Strategy
/// --------
/// 1. Keep Google OAuth hosts inside the same WebView so the post-login
///    session cookie is written into the WebView cookie jar (not Chrome).
/// 2. Strip the Android WebView "; wv" token from the user agent. Google
///    OAuth commonly rejects embedded WebViews that advertise themselves
///    as WebView via that marker.
/// 3. Do NOT reopen the removed Flutter `google_sign_in` flow.
///
/// If Google still blocks OAuth inside the WebView on a device, the next
/// step would be a Custom Tabs / ASWebAuthenticationSession bridge that
/// returns the callback URL into this WebView. That requires either:
///   - App Links / Universal Links for https://indovyapar.com/..., or
///   - a website redirect URI change (must not be done without approval).
///
/// Until that is required by a failing device test, OAuth stays in-WebView.
library;

class GoogleOAuthBridge {
  const GoogleOAuthBridge._();
}
