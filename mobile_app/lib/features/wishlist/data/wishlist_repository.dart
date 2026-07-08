import '../domain/entities/wishlist_item.dart';
import 'wishlist_remote_data_source.dart';

abstract interface class WishlistRepository {
  Future<List<WishlistItem>> getItems();
  Future<void> add(String productId, {String? variantKey});
  Future<void> remove(String wishlistItemId);
  Future<void> clear();
}

class WishlistRepositoryImpl implements WishlistRepository {
  WishlistRepositoryImpl(this._remote);

  final WishlistRemoteDataSource _remote;

  @override
  Future<List<WishlistItem>> getItems() async {
    final raw = await _remote.getItems();
    return raw
        .whereType<Map>()
        .map((e) => WishlistItem.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  @override
  Future<void> add(String productId, {String? variantKey}) =>
      _remote.add(productId, variantKey: variantKey);

  @override
  Future<void> remove(String wishlistItemId) => _remote.remove(wishlistItemId);

  @override
  Future<void> clear() => _remote.clear();
}
