/// URL policy for the Customer WebView container.
///
/// IndoVyapar website URLs stay inside the WebView.
/// External schemes / hosts are opened outside the WebView when needed.
class WebViewUrlPolicy {
  const WebViewUrlPolicy({
    this.allowedHosts = const {'indovyapar.com', 'www.indovyapar.com'},
  });

  final Set<String> allowedHosts;

  static const productionUrl = 'https://indovyapar.com';

  /// Hosts that participate in website Google OAuth and must stay in-WebView
  /// so session cookies land in the same WebView cookie jar.
  static const oauthHosts = {
    'accounts.google.com',
    'accounts.youtube.com',
    'oauth2.googleapis.com',
    'www.googleapis.com',
    'google.com',
    'www.google.com',
    'apis.google.com',
  };

  /// Payment / checkout hosts commonly opened during Razorpay / bank flows.
  /// Keep them in-WebView so the website can complete the return path.
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

  bool isOAuthHost(String? host) {
    if (host == null || host.isEmpty) return false;
    final h = host.toLowerCase();
    return oauthHosts.contains(h) || h.endsWith('.google.com');
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

  /// Whether this navigation should remain inside the WebView.
  ///
  /// Any http(s) URL stays in-WebView. Razorpay card/UPI flows redirect to
  /// bank ACS and other third-party hosts; those must not leave the WebView
  /// or payment completion (`handler` → `/api/payments/verify`) never runs.
  bool shouldStayInWebView(Uri uri) {
    final scheme = uri.scheme.toLowerCase();
    if (scheme != 'http' && scheme != 'https') return false;
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
