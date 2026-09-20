import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/webview/webview_url_policy.dart';

void main() {
  const policy = WebViewUrlPolicy();

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

  test('Google OAuth hosts stay in WebView for cookie continuity', () {
    expect(
      policy.shouldStayInWebView(
        Uri.parse('https://accounts.google.com/o/oauth2/v2/auth'),
      ),
      isTrue,
    );
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
}
