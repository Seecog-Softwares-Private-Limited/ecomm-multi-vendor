/// URL policy for the Customer WebView container.
///
/// IndoVyapar website URLs stay inside the WebView.
/// Google OAuth authorization must NOT stay in the WebView — the app opens
/// it via [GoogleOAuthBridge] (Chrome Custom Tabs / ASWebAuthenticationSession).
/// Other http(s) hosts (Razorpay, bank ACS, etc.) stay in-WebView so payment
/// completion can finish. External schemes are opened outside when needed.
class WebViewUrlPolicy {
  const WebViewUrlPolicy({
    this.allowedHosts = const {'indovyapar.com', 'www.indovyapar.com'},
  });

  final Set<String> allowedHosts;

  /// Prefer www so host-only auth cookies from the production OAuth callback
  /// host (`www.indovyapar.com`) are visible to the WebView session.
  static const productionUrl = 'https://www.indovyapar.com';

  /// Payment / checkout hosts commonly opened during Razorpay / bank flows.
  /// Kept for callers/docs; [shouldStayInWebView] allows all http(s) except
  /// Google OAuth authorize hosts so bank ACS redirects are not blocked.
  static const paymentHosts = {
    'api.razorpay.com',
    'checkout.razorpay.com',
    'razorpay.com',
    'www.razorpay.com',
  };

  bool isAllowedHost(String? host) {
    if (host == null || host.isEmpty) return false;
    final h = host.toLowerCase();
    if (allowedHosts.contains(h)) return true;
    for (final allowed in allowedHosts) {
      if (h.endsWith('.$allowed')) return true;
    }
    return false;
  }

  bool isPaymentHost(String? host) {
    if (host == null || host.isEmpty) return false;
    final h = host.toLowerCase();
    if (paymentHosts.contains(h)) return true;
    for (final allowed in paymentHosts) {
      if (h.endsWith('.$allowed')) return true;
    }
    return false;
  }

  /// True when [uri] is a Google authorization host that must leave the WebView.
  bool isGoogleAuthorizationHost(Uri uri) {
    if (uri.scheme != 'http' && uri.scheme != 'https') return false;
    final host = uri.host.toLowerCase();
    if (host == 'accounts.google.com' || host == 'accounts.youtube.com') {
      return true;
    }
    return host.endsWith('.google.com') && host.contains('accounts');
  }

  /// Whether this navigation should remain inside the WebView.
  ///
  /// Any http(s) URL stays in-WebView so Razorpay card/UPI flows that redirect
  /// to bank ACS and other third-party hosts can complete (`handler` →
  /// `/api/payments/verify`). Google OAuth authorize hosts are excluded —
  /// use [GoogleOAuthBridge].
  bool shouldStayInWebView(Uri uri) {
    final scheme = uri.scheme.toLowerCase();
    if (scheme != 'http' && scheme != 'https') return false;
    if (isGoogleAuthorizationHost(uri)) return false;
    return true;
  }

  /// Schemes that should be handed to another app (phone, mail, maps, etc.).
  bool isExternalAppScheme(Uri uri) {
    final scheme = uri.scheme.toLowerCase();
    return scheme == 'tel' ||
        scheme == 'mailto' ||
        scheme == 'sms' ||
        scheme == 'geo' ||
        scheme == 'whatsapp' ||
        scheme == 'intent' ||
        scheme == 'market' ||
        scheme == 'upi' ||
        scheme == 'phonepe' ||
        scheme == 'gpay' ||
        scheme == 'paytmmp';
  }
}
