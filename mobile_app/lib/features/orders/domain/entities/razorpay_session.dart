/// Server response from POST /api/payments/razorpay-order (unwrapped `data`).
class RazorpaySession {
  const RazorpaySession({
    required this.configured,
    required this.orderId,
    this.razorpayOrderId,
    this.amountPaise,
    this.currency = 'INR',
    this.keyId,
    this.customerEmail,
    this.customerPhone,
    this.message,
  });

  final bool configured;
  final String orderId;
  final String? razorpayOrderId;
  final int? amountPaise;
  final String currency;
  final String? keyId;
  final String? customerEmail;
  final String? customerPhone;
  final String? message;

  factory RazorpaySession.fromJson(Map<String, dynamic> json) {
    return RazorpaySession(
      configured: json['configured'] != false,
      orderId: json['orderId']?.toString() ?? '',
      razorpayOrderId: json['razorpayOrderId']?.toString(),
      amountPaise: (json['amount'] as num?)?.toInt(),
      currency: json['currency']?.toString() ?? 'INR',
      keyId: json['keyId']?.toString(),
      customerEmail: json['customerEmail']?.toString(),
      customerPhone: json['customerPhone']?.toString(),
      message: json['message']?.toString(),
    );
  }

  bool get isReady =>
      configured &&
      razorpayOrderId != null &&
      razorpayOrderId!.isNotEmpty &&
      keyId != null &&
      keyId!.isNotEmpty &&
      amountPaise != null &&
      amountPaise! >= 100;
}

/// Result of opening Razorpay checkout in the app.
sealed class RazorpayCheckoutResult {
  const RazorpayCheckoutResult();
}

class RazorpayCheckoutSuccess extends RazorpayCheckoutResult {
  const RazorpayCheckoutSuccess({
    required this.paymentId,
    required this.orderId,
    required this.signature,
  });

  final String paymentId;
  final String orderId;
  final String signature;
}

class RazorpayCheckoutFailure extends RazorpayCheckoutResult {
  const RazorpayCheckoutFailure({required this.message, this.cancelled = false});

  final String message;
  final bool cancelled;
}
