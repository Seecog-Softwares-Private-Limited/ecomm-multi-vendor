import '../entities/cart_item.dart';

abstract interface class CartRepository {
  Future<List<CartItem>> getItems();
  Future<void> add(String productId, {int quantity, String? variantKey});
  Future<void> updateQuantity(String cartItemId, int quantity);
  Future<void> remove(String cartItemId);
  Future<void> setSavedForLater(String cartItemId, {required bool saved});
  Future<List<CartItem>> getSavedItems();
}
