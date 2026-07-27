import 'dart:async';

import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../domain/entities/razorpay_session.dart';

/// Opens native Razorpay checkout (UPI / card) using a server-created order.
class RazorpayCheckoutService {
  RazorpayCheckoutService() : _razorpay = Razorpay();

  final Razorpay _razorpay;
  Completer<RazorpayCheckoutResult>? _active;

  Future<RazorpayCheckoutResult> openCheckout(
    RazorpaySession session, {
    String paymentMethod = 'card',
  }) {
    if (!session.isReady) {
      return Future.value(
        const RazorpayCheckoutFailure(message: 'Payment session is incomplete. Please try again.'),
      );
    }

    if (_active != null && !_active!.isCompleted) {
      return Future.value(
        const RazorpayCheckoutFailure(message: 'A payment is already in progress.'),
      );
    }

    final completer = Completer<RazorpayCheckoutResult>();
    _active = completer;

    void finish(RazorpayCheckoutResult result) {
      _razorpay.clear();
      if (!completer.isCompleted) completer.complete(result);
      if (identical(_active, completer)) _active = null;
    }

    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse response) {
      finish(
        RazorpayCheckoutSuccess(
          paymentId: response.paymentId ?? '',
          orderId: response.orderId ?? '',
          signature: response.signature ?? '',
        ),
      );
    });

    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse response) {
      final code = response.code;
      final cancelled = code == 2; // Razorpay: user cancelled checkout
      final message = (response.message ?? '').trim().isNotEmpty
          ? response.message!.trim()
          : cancelled
              ? 'Payment was cancelled.'
              : 'Payment failed. Please try again.';
      finish(RazorpayCheckoutFailure(message: message, cancelled: cancelled));
    });

    final email = (session.customerEmail ?? '').trim();
    final phone = _formatPhone(session.customerPhone);
    final prefill = <String, String>{
      if (email.isNotEmpty) 'email': email,
      if (phone.isNotEmpty) 'contact': phone,
    };
    if (paymentMethod == 'upi') {
      prefill['method'] = 'upi';
    }

    final options = <String, dynamic>{
      'key': session.keyId,
      'amount': session.amountPaise,
      'currency': session.currency,
      'order_id': session.razorpayOrderId,
      'name': 'Indovyapar',
      'description': 'Order payment',
      if (prefill.isNotEmpty) 'prefill': prefill,
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      finish(RazorpayCheckoutFailure(message: 'Could not open payment: $e'));
    }

    return completer.future;
  }

  void dispose() {
    _razorpay.clear();
    _active = null;
  }

  static String _formatPhone(String? raw) {
    var digits = (raw ?? '').replaceAll(RegExp(r'\D'), '');
    if (digits.length > 10) digits = digits.substring(digits.length - 10);
    if (digits.length == 10) return '+91$digits';
    return digits.isNotEmpty ? digits : '';
  }
}
