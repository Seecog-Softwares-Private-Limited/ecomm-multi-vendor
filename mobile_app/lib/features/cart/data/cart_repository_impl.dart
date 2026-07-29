import '../domain/entities/cart_item.dart';
import '../domain/repositories/cart_repository.dart';
import 'cart_remote_data_source.dart';

class CartRepositoryImpl implements CartRepository {
  CartRepositoryImpl(this._remote);

  final CartRemoteDataSource _remote;

  @override
  Future<List<CartItem>> getItems() async {
    final raw = await _remote.getItems();
    return raw
        .whereType<Map>()
        .map((e) => CartItem.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  @override
  Future<void> add(String productId, {int quantity = 1, String? variantKey}) =>
      _remote.add(productId, quantity: quantity, variantKey: variantKey);

  @override
  Future<void> updateQuantity(String cartItemId, int quantity) =>
      _remote.updateQuantity(cartItemId, quantity);

  @override
  Future<void> remove(String cartItemId) => _remote.remove(cartItemId);

  @override
  Future<void> setSavedForLater(String cartItemId, {required bool saved}) =>
      _remote.setSavedForLater(cartItemId, saved: saved);

  @override
  Future<List<CartItem>> getSavedItems() async {
    final raw = await _remote.getSavedItems();
    return raw
        .whereType<Map>()
        .map((e) => CartItem.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }
}
