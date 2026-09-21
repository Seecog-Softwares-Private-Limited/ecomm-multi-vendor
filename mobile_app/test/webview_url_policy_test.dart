import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/webview/google_oauth_bridge.dart';
import 'package:indovyapar_customer/webview/webview_url_policy.dart';

void main() {
  const policy = WebViewUrlPolicy();
  const bridge = GoogleOAuthBridge();

  test('production site stays in WebView', () {
    expect(
      policy.shouldStayInWebView(Uri.parse('https://indovyapar.com/cart')),
      isTrue,
    );
    expect(
      policy.shouldStayInWebView(Uri.parse('https://www.indovyapar.com/login')),
      isTrue,
    );
  });

  test('Google OAuth hosts do NOT stay in WebView', () {
    expect(
      policy.shouldStayInWebView(
        Uri.parse('https://accounts.google.com/o/oauth2/v2/auth'),
      ),
      isFalse,
    );
  });

  test('bridge detects Google OAuth start URL', () {
    expect(
      bridge.isGoogleOAuthStart(
        Uri.parse('https://www.indovyapar.com/api/auth/oauth/google?returnUrl=%2F'),
      ),
      isTrue,
    );
    expect(
      bridge.isGoogleOAuthStart(
        Uri.parse(
          'https://www.indovyapar.com/api/auth/oauth/google/callback?code=x',
        ),
      ),
      isFalse,
    );
    expect(
      bridge.isGoogleOAuthStart(
        Uri.parse(
          'https://www.indovyapar.com/api/auth/oauth/native-complete?token=x',
        ),
      ),
      isFalse,
    );
  });

  test('bridge adds native=1 to start URL', () {
    final start = bridge.buildNativeStartUrl(
      Uri.parse('https://www.indovyapar.com/api/auth/oauth/google?returnUrl=%2Fcart'),
    );
    expect(start.queryParameters['native'], '1');
    expect(start.queryParameters['returnUrl'], '/cart');
  });

  test('tel and mailto are external app schemes', () {
    expect(policy.isExternalAppScheme(Uri.parse('tel:+911234567890')), isTrue);
    expect(
      policy.isExternalAppScheme(Uri.parse('mailto:support@indovyapar.com')),
      isTrue,
    );
  });

  test('unrelated https hosts leave the WebView', () {
    expect(
      policy.shouldStayInWebView(Uri.parse('https://example.com/page')),
      isFalse,
    );
  });

  test('productionUrl uses www for cookie host alignment', () {
    expect(WebViewUrlPolicy.productionUrl, 'https://www.indovyapar.com');
  });
}
