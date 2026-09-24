import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/webview/customer_native_marker.dart';
import 'package:indovyapar_customer/webview/webview_url_policy.dart';

void main() {
  test('customer native marker sets the expected window flag', () {
    expect(
      customerNativeMarkerJavaScript,
      contains('__INDOVYAPAR_CUSTOMER_NATIVE__'),
    );
    expect(customerNativeMarkerJavaScript, contains('=true'));
    expect(customerNativeMarkerJavaScript, isNot(contains('__INDOVYAPAR_NATIVE__')));
  });

  test('marker injection hosts are IndoVyapar only (policy)', () {
    const policy = WebViewUrlPolicy();
    expect(policy.isAllowedHost('www.indovyapar.com'), isTrue);
    expect(policy.isAllowedHost('indovyapar.com'), isTrue);
    expect(policy.isAllowedHost('checkout.razorpay.com'), isFalse);
    expect(policy.isAllowedHost('accounts.google.com'), isFalse);
  });
}
