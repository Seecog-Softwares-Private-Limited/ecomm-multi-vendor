import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/error/failure.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/cart_remote_data_source.dart';
import '../data/cart_repository_impl.dart';
import '../domain/entities/cart_item.dart';
import '../domain/repositories/cart_repository.dart';

/** Set to e.g. 50 when re-enabling delivery charges. */
const double kShippingCost = 0;
const double kFreeShippingThreshold = 500;
const double kDefaultGstPercent = 18;

final cartRemoteDataSourceProvider = Provider<CartRemoteDataSource>(
  (ref) => CartRemoteDataSource(ref.read(dioClientProvider)),
);

final cartRepositoryProvider = Provider<CartRepository>(
  (ref) => CartRepositoryImpl(ref.read(cartRemoteDataSourceProvider)),
);

/// Money breakdown for the cart / checkout summary.
class CartSummary {
  const CartSummary({
    required this.subtotal,
    required this.savings,
    required this.shipping,
    required this.tax,
    this.couponDiscount = 0,
    this.totalOverride,
  });

  final double subtotal;
  final double savings;
  final double shipping;
  final double tax;
  final double couponDiscount;
  /// When set (e.g. checkout session totals), use server-computed total.
  final double? totalOverride;

  double get total => totalOverride ?? (subtotal + shipping + tax);
}

class CartState {
  const CartState({
    this.items = const [],
    this.savedForLater = const [],
    this.couponCode,
  });

  final List<CartItem> items;
  final List<CartItem> savedForLater;
  final String? couponCode;

  int get totalQuantity => items.fold(0, (sum, i) => sum + i.quantity);
  bool get isEmpty => items.isEmpty;

  CartSummary get summary {
    final subtotal = items.fold<double>(0, (sum, i) => sum + i.lineTotal);
    final savings = items.fold<double>(0, (sum, i) => sum + i.lineSavings);
    final tax = items.fold<double>(
      0,
      (sum, i) => sum + i.lineTotal * ((i.product.gstPercent ?? kDefaultGstPercent) / 100),
    );
    final shipping = items.isEmpty || kShippingCost <= 0 || subtotal >= kFreeShippingThreshold
        ? 0.0
        : kShippingCost;
    return CartSummary(subtotal: subtotal, savings: savings, shipping: shipping, tax: tax);
  }

  CartState copyWith({
    List<CartItem>? items,
    List<CartItem>? savedForLater,
    String? couponCode,
    bool clearCoupon = false,
  }) {
    return CartState(
      items: items ?? this.items,
      savedForLater: savedForLater ?? this.savedForLater,
      couponCode: clearCoupon ? null : (couponCode ?? this.couponCode),
    );
  }
}

class CartController extends AsyncNotifier<CartState> {
  CartRepository get _repo => ref.read(cartRepositoryProvider);

  @override
  Future<CartState> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const CartState();
    final results = await Future.wait([_repo.getItems(), _repo.getSavedItems()]);
    final current = state.value;
    return CartState(
      items: results[0],
      savedForLater: results[1],
      couponCode: current?.couponCode,
    );
  }

  CartState get _state => state.value ?? const CartState();

  Future<void> refresh() async {
    final results = await Future.wait([_repo.getItems(), _repo.getSavedItems()]);
    state = AsyncData(_state.copyWith(items: results[0], savedForLater: results[1]));
  }

  Future<Failure?> add(String productId, {int quantity = 1, String? variantKey}) async {
    try {
      await _repo.add(productId, quantity: quantity, variantKey: variantKey);
      await refresh();
      return null;
    } catch (error) {
      return Failure.from(error);
    }
  }

  Future<void> setQuantity(CartItem item, int quantity) async {
    if (quantity < 1) return;
    final previous = _state.items;
    final updated = [
      for (final i in previous) if (i.id == item.id) i.copyWith(quantity: quantity) else i,
    ];
    state = AsyncData(_state.copyWith(items: updated));
    try {
      await _repo.updateQuantity(item.id, quantity);
    } catch (_) {
      state = AsyncData(_state.copyWith(items: previous));
      rethrow;
    }
  }

  Future<void> remove(CartItem item) async {
    final previous = _state.items;
    state = AsyncData(_state.copyWith(items: previous.where((i) => i.id != item.id).toList()));
    try {
      await _repo.remove(item.id);
    } catch (_) {
      state = AsyncData(_state.copyWith(items: previous));
      rethrow;
    }
  }

  Future<void> saveForLater(CartItem item) async {
    await _repo.setSavedForLater(item.id, saved: true);
    state = AsyncData(
      _state.copyWith(
        items: _state.items.where((i) => i.id != item.id).toList(),
        savedForLater: [..._state.savedForLater, item],
      ),
    );
  }

  Future<Failure?> moveToCart(CartItem item) async {
    await _repo.setSavedForLater(item.id, saved: false);
    state = AsyncData(
      _state.copyWith(
        savedForLater: _state.savedForLater.where((i) => i.id != item.id).toList(),
      ),
    );
    return add(item.productId, quantity: item.quantity, variantKey: item.variantKey);
  }

  void applyCoupon(String code) => state = AsyncData(_state.copyWith(couponCode: code.trim().toUpperCase()));

  void clearCoupon() => state = AsyncData(_state.copyWith(clearCoupon: true));

  void clearAfterOrder() =>
      state = AsyncData(_state.copyWith(items: const [], clearCoupon: true));
}

final cartControllerProvider =
    AsyncNotifierProvider<CartController, CartState>(CartController.new);

/// Live cart quantity for the bottom-nav badge.
final cartCountProvider = Provider<int>((ref) {
  return ref.watch(cartControllerProvider).value?.totalQuantity ?? 0;
});
