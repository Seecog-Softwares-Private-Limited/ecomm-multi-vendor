import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

class CartRemoteDataSource {
  CartRemoteDataSource(this._client);

  final DioClient _client;

  Future<List<dynamic>> getItems() async {
    final data = await _client.get(ApiEndpoints.cartItems);
    final map = Map<String, dynamic>.from(data as Map);
    return (map['items'] as List?) ?? const [];
  }

  Future<void> add(String productId, {int quantity = 1, String? variantKey}) async {
    await _client.post(ApiEndpoints.cartItems, data: {
      'productId': productId,
      'quantity': quantity,
      'variantKey': variantKey,
    });
  }

  Future<void> updateQuantity(String cartItemId, int quantity) async {
    await _client.patch(ApiEndpoints.cartItem(cartItemId), data: {'quantity': quantity});
  }

  Future<void> remove(String cartItemId) async {
    await _client.delete(ApiEndpoints.cartItem(cartItemId));
  }

  Future<void> setSavedForLater(String cartItemId, {required bool saved}) async {
    await _client.patch(ApiEndpoints.cartItem(cartItemId), data: {
      'action': saved ? 'save_for_later' : 'move_to_cart',
    });
  }

  Future<List<dynamic>> getSavedItems() async {
    final data = await _client.get(ApiEndpoints.cartSaved);
    final map = Map<String, dynamic>.from(data as Map);
    return (map['items'] as List?) ?? const [];
  }
}
