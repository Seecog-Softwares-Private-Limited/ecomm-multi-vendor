import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/webview/android_intent_launcher.dart';

void main() {
  test('rewrites Razorpay GPay intent:// to upi:// before browser fallback', () {
    const raw =
        'intent://pay?pa=merchant@oksbi&pn=Test%20Shop&am=499.00&cu=INR&tn=Payment'
        '#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;'
        'S.browser_fallback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_xxx%2Fcallback;end';

    expect(
      AndroidIntentLauncher.rewriteIntentToAppScheme(raw),
      'upi://pay?pa=merchant@oksbi&pn=Test%20Shop&am=499.00&cu=INR&tn=Payment',
    );
    expect(
      AndroidIntentLauncher.extractBrowserFallbackUrl(raw),
      'https://api.razorpay.com/v1/payments/pay_xxx/callback',
    );
  });

  test('rewrites PhonePe intent:// to upi://', () {
    const raw =
        'intent://pay?pa=merchant@ybl&pn=Shop&am=1.00'
        '#Intent;scheme=upi;package=com.phonepe.app;'
        'S.browser_fallback_url=https%3A%2F%2Frazorpay.com;end';

    expect(
      AndroidIntentLauncher.rewriteIntentToAppScheme(raw),
      'upi://pay?pa=merchant@ybl&pn=Shop&am=1.00',
    );
  });

  test('handles intent: without authority', () {
    const raw = 'intent:#Intent;scheme=upi;package=com.phonepe.app;end';
    expect(
      AndroidIntentLauncher.rewriteIntentToAppScheme(raw),
      'upi://',
    );
  });
}
