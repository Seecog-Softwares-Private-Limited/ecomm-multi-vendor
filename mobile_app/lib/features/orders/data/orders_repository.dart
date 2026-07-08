import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/entities/order.dart';

abstract interface class OrdersRepository {
  Future<List<OrderSummary>> getOrders();
  Future<OrderDetail> getOrder(String id);
  Future<PlaceOrderResult> placeOrder({
    required String shippingAddressId,
    required String paymentMethod,
    String? couponCode,
  });
  Future<OrderDetail> cancel(String id, {String? reason});
}

class OrdersRepositoryImpl implements OrdersRepository {
  OrdersRepositoryImpl(this._client);

  final DioClient _client;

  @override
  Future<List<OrderSummary>> getOrders() async {
    final data = await _client.get(ApiEndpoints.orders);
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
  }) async {
    final data = await _client.post(ApiEndpoints.orders, data: {
      'shippingAddressId': shippingAddressId,
      'paymentMethod': paymentMethod,
      'couponCode': ?couponCode,
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
  Future<OrderDetail> cancel(String id, {String? reason}) async {
    final data = await _client.patch(ApiEndpoints.order(id), data: {
      'action': 'cancel',
      'reason': ?reason,
    });
    final map = Map<String, dynamic>.from(data as Map);
    return OrderDetail.fromJson(Map<String, dynamic>.from(map['order'] as Map));
  }
}
