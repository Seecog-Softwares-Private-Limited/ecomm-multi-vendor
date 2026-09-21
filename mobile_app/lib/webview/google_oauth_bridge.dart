import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';

/// Native Google OAuth bridge for the Customer WebView app.
///
/// The website still owns OAuth (`/api/auth/oauth/google`). This bridge only:
/// 1. Opens that start URL in Chrome Custom Tabs (Android) /
///    ASWebAuthenticationSession (iOS).
/// 2. Receives the custom-scheme callback with a one-time hand-off token.
/// 3. Returns a URL the WebView must load to set the `auth_token` cookie.
class GoogleOAuthBridge {
  const GoogleOAuthBridge({
    this.callbackUrlScheme = callbackScheme,
    this.siteOrigin = defaultSiteOrigin,
  });

  /// Must match Android intent-filter + iOS CFBundleURLSchemes + server redirect.
  static const callbackScheme = 'indovyaparcustomer';

  /// Production OAuth + cookie host (matches server redirect_uri host).
  static const defaultSiteOrigin = 'https://www.indovyapar.com';

  static const nativeCompletePath = '/api/auth/oauth/native-complete';

  final String callbackUrlScheme;
  final String siteOrigin;

  /// True when [uri] is the website Google OAuth *start* endpoint
  /// (not the Google callback, not native-complete).
  bool isGoogleOAuthStart(Uri uri) {
    if (uri.scheme != 'http' && uri.scheme != 'https') return false;
    final path = uri.path.toLowerCase().replaceAll(RegExp(r'/+$'), '');
    return path == '/api/auth/oauth/google';
  }

  /// True when [uri] is a Google authorization host that must not stay in WebView.
  bool isGoogleAuthorizationHost(Uri uri) {
    if (uri.scheme != 'http' && uri.scheme != 'https') return false;
    final host = uri.host.toLowerCase();
    if (host == 'accounts.google.com' || host == 'accounts.youtube.com') {
      return true;
    }
    return host.endsWith('.google.com') && host.contains('accounts');
  }

  /// Appends `native=1` so the server returns a custom-scheme hand-off.
  Uri buildNativeStartUrl(Uri startUri) {
    final params = Map<String, String>.from(startUri.queryParameters);
    params['native'] = '1';
    return startUri.replace(queryParameters: params);
  }

  /// Runs system auth UI; returns the WebView redeem URL, or null if cancelled.
  ///
  /// Throws [GoogleOAuthBridgeException] on auth failure (non-cancel).
  Future<Uri?> authenticate({required Uri oauthStartUri}) async {
    final start = buildNativeStartUrl(oauthStartUri);
    late final String resultUrl;
    try {
      resultUrl = await FlutterWebAuth2.authenticate(
        url: start.toString(),
        callbackUrlScheme: callbackUrlScheme,
      );
    } on Exception catch (e) {
      final msg = e.toString().toLowerCase();
      if (msg.contains('cancel') ||
          msg.contains('cancelled') ||
          msg.contains('canceled')) {
        return null;
      }
      throw GoogleOAuthBridgeException(
        'Google sign-in failed. Please try again.',
        cause: e,
      );
    }

    final returned = Uri.tryParse(resultUrl);
    if (returned == null) {
      throw GoogleOAuthBridgeException(
        'Google sign-in did not complete. Please try again.',
      );
    }

    final error = returned.queryParameters['error'];
    if (error != null && error.isNotEmpty) {
      throw GoogleOAuthBridgeException(error);
    }

    final token = returned.queryParameters['token'];
    if (token == null || token.isEmpty) {
      throw GoogleOAuthBridgeException(
        'Google sign-in did not complete. Please try again.',
      );
    }

    final returnUrl = returned.queryParameters['returnUrl'] ?? '/';
    return Uri.parse('$siteOrigin$nativeCompletePath').replace(
      queryParameters: {
        'token': token,
        'returnUrl': returnUrl,
      },
    );
  }
}

class GoogleOAuthBridgeException implements Exception {
  GoogleOAuthBridgeException(this.message, {this.cause});

  final String message;
  final Object? cause;

  @override
  String toString() => message;
}
