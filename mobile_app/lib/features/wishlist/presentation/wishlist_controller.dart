import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/error/failure.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/wishlist_remote_data_source.dart';
import '../data/wishlist_repository.dart';
import '../domain/entities/wishlist_item.dart';

final wishlistRemoteDataSourceProvider = Provider<WishlistRemoteDataSource>(
  (ref) => WishlistRemoteDataSource(ref.read(dioClientProvider)),
);

final wishlistRepositoryProvider = Provider<WishlistRepository>(
  (ref) => WishlistRepositoryImpl(ref.read(wishlistRemoteDataSourceProvider)),
);

class WishlistController extends AsyncNotifier<List<WishlistItem>> {
  WishlistRepository get _repo => ref.read(wishlistRepositoryProvider);

  @override
  Future<List<WishlistItem>> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const [];
    return _repo.getItems();
  }

  List<WishlistItem> get _items => state.value ?? const [];

  Future<void> refresh() async {
    state = AsyncData(await _repo.getItems());
  }

  bool isWishlisted(String productId) => _items.any((i) => i.productId == productId);

  /// Adds or removes based on current membership. Returns a [Failure] on error.
  Future<Failure?> toggle(String productId, {String? variantKey}) async {
    try {
      final existing = _items.where((i) => i.productId == productId).toList();
      if (existing.isNotEmpty) {
        final previous = _items;
        state = AsyncData(_items.where((i) => i.productId != productId).toList());
        try {
          await _repo.remove(existing.first.id);
        } catch (_) {
          state = AsyncData(previous);
          rethrow;
        }
      } else {
        await _repo.add(productId, variantKey: variantKey);
        await refresh();
      }
      return null;
    } catch (error) {
      return Failure.from(error);
    }
  }

  Future<void> removeItem(WishlistItem item) async {
    final previous = _items;
    state = AsyncData(_items.where((i) => i.id != item.id).toList());
    try {
      await _repo.remove(item.id);
    } catch (_) {
      state = AsyncData(previous);
      rethrow;
    }
  }

  Future<void> clearAll() async {
    final previous = _items;
    state = const AsyncData([]);
    try {
      await _repo.clear();
    } catch (_) {
      state = AsyncData(previous);
      rethrow;
    }
  }
}

final wishlistControllerProvider =
    AsyncNotifierProvider<WishlistController, List<WishlistItem>>(WishlistController.new);

/// Set of product ids currently in the wishlist (for quick card lookups).
final wishlistedIdsProvider = Provider<Set<String>>((ref) {
  final items = ref.watch(wishlistControllerProvider).value ?? const [];
  return items.map((i) => i.productId).toSet();
});
