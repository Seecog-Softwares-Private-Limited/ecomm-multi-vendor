import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

class CheckoutRemoteDataSource {
  CheckoutRemoteDataSource(this._client);

  final DioClient _client;

  Future<String> createBuyNowSession({
    required String productId,
    required int quantity,
    String? variantKey,
  }) async {
    final data = await _client.post(ApiEndpoints.checkoutSessions, data: {
      'type': 'BUY_NOW',
      'lines': [
        {
          'productId': productId,
          'quantity': quantity,
          'variantKey': variantKey,
        },
      ],
    });
    final map = Map<String, dynamic>.from(data as Map);
    return map['sessionId']?.toString() ?? '';
  }

  Future<String> createCartSession(List<String> cartItemIds) async {
    final data = await _client.post(ApiEndpoints.checkoutSessions, data: {
      'type': 'CART',
      'cartItemIds': cartItemIds,
    });
    final map = Map<String, dynamic>.from(data as Map);
    return map['sessionId']?.toString() ?? '';
  }

  Future<String> createReorderSession(
    List<Map<String, dynamic>> lines,
  ) async {
    final data = await _client.post(ApiEndpoints.checkoutSessions, data: {
      'type': 'REORDER',
      'lines': lines,
    });
    final map = Map<String, dynamic>.from(data as Map);
    return map['sessionId']?.toString() ?? '';
  }

  Future<Map<String, dynamic>> getSession(String sessionId, {String? couponCode}) async {
    final suffix = couponCode != null && couponCode.isNotEmpty
        ? '?couponCode=${Uri.encodeComponent(couponCode)}'
        : '';
    final data = await _client.get('${ApiEndpoints.checkoutSession(sessionId)}$suffix');
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> confirmPrices(String sessionId) async {
    await _client.patch(ApiEndpoints.checkoutSession(sessionId), data: {
      'action': 'confirm_prices',
    });
  }

  Future<void> cancelSession(String sessionId) async {
    await _client.patch(ApiEndpoints.checkoutSession(sessionId), data: {
      'action': 'cancel',
    });
  }
}
