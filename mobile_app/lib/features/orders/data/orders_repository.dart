import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/entities/order.dart';
import '../domain/entities/razorpay_session.dart';

abstract interface class OrdersRepository {
  Future<List<OrderSummary>> getOrders({
    String? status,
    String? search,
    String sort = 'newest',
  });
  Future<OrderDetail> getOrder(String id);
  Future<PlaceOrderResult> placeOrder({
    required String shippingAddressId,
    required String paymentMethod,
    String? couponCode,
    String? checkoutSessionId,
    String? idempotencyKey,
    bool confirmPriceChange = false,
  });
  Future<RazorpaySession> createRazorpayOrder(String orderId);
  Future<void> verifyRazorpayPayment({
    required String orderId,
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
  });
  Future<OrderDetail> cancel(String id, {String? reason});
}

class OrdersRepositoryImpl implements OrdersRepository {
  OrdersRepositoryImpl(this._client);

  final DioClient _client;

  @override
  Future<List<OrderSummary>> getOrders({
    String? status,
    String? search,
    String sort = 'newest',
  }) async {
    final query = <String, String>{
      'sort': sort,
      if (status != null && status.isNotEmpty && status != 'all') 'status': status,
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
    };
    final data = await _client.get(ApiEndpoints.orders, query: query);
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['orders'] as List?) ?? const [];
    return list
        .whereType<Map>()
        .map((e) => OrderSummary.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  @override
  Future<OrderDetail> getOrder(String id) async {
    final data = await _client.get(ApiEndpoints.order(id));
    final map = Map<String, dynamic>.from(data as Map);
    return OrderDetail.fromJson(Map<String, dynamic>.from(map['order'] as Map));
  }

  @override
  Future<PlaceOrderResult> placeOrder({
    required String shippingAddressId,
    required String paymentMethod,
    String? couponCode,
    String? checkoutSessionId,
    String? idempotencyKey,
    bool confirmPriceChange = false,
  }) async {
    final data = await _client.post(ApiEndpoints.orders, data: {
      'shippingAddressId': shippingAddressId,
      'paymentMethod': paymentMethod,
      'couponCode': ?couponCode,
      'checkoutSessionId': ?checkoutSessionId,
      'idempotencyKey': ?idempotencyKey,
      'confirmPriceChange': confirmPriceChange,
    });
    final map = Map<String, dynamic>.from(data as Map);
    return PlaceOrderResult(
      orderId: map['orderId']?.toString() ?? '',
      totalAmount: (map['totalAmount'] as num?)?.toDouble() ?? 0,
      requiresRazorpay: map['requiresRazorpay'] == true,
      message: map['message']?.toString() ?? 'Order placed successfully',
    );
  }

  @override
  Future<RazorpaySession> createRazorpayOrder(String orderId) async {
    final data = await _client.post(
      ApiEndpoints.razorpayOrder,
      data: {'orderId': orderId},
    );
    final map = Map<String, dynamic>.from(data as Map);
    return RazorpaySession.fromJson(map);
  }

  @override
  Future<void> verifyRazorpayPayment({
    required String orderId,
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
  }) async {
    await _client.post(
      ApiEndpoints.verifyPayment,
      data: {
        'orderId': orderId,
        'razorpayPaymentId': razorpayPaymentId,
        'razorpayOrderId': razorpayOrderId,
        'razorpaySignature': razorpaySignature,
      },
    );
  }

  @override
  Future<OrderDetail> cancel(String id, {String? reason}) async {
    final data = await _client.patch(ApiEndpoints.order(id), data: {
      'action': 'cancel',
      'reason': ?reason,
    });
    final map = Map<String, dynamic>.from(data as Map);
    return OrderDetail.fromJson(Map<String, dynamic>.from(map['order'] as Map));
  }
}
