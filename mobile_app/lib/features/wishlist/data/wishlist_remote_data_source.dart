import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

class WishlistRemoteDataSource {
  WishlistRemoteDataSource(this._client);

  final DioClient _client;

  Future<List<dynamic>> getItems() async {
    final data = await _client.get(ApiEndpoints.wishlist);
    final map = Map<String, dynamic>.from(data as Map);
    return (map['items'] as List?) ?? const [];
  }

  Future<void> add(String productId, {String? variantKey}) async {
    await _client.post(ApiEndpoints.wishlist, data: {
      'productId': productId,
      'variantKey': variantKey,
    });
  }

  Future<void> remove(String wishlistItemId) async {
    await _client.delete(ApiEndpoints.wishlistItem(wishlistItemId));
  }

  Future<void> clear() async {
    await _client.delete(ApiEndpoints.wishlist);
  }
}
