import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/app_snackbar.dart';
import '../../wishlist/presentation/wishlist_controller.dart';
import 'cart_controller.dart';

/// Shared cart/wishlist actions with consistent snackbar feedback, used by
/// product cards, the PDP, wishlist and search results.
extension CommerceActions on WidgetRef {
  Future<void> addToCart(
    BuildContext context,
    String productId, {
    int quantity = 1,
    String? variantKey,
  }) async {
    final failure =
        await read(cartControllerProvider.notifier).add(productId, quantity: quantity, variantKey: variantKey);
    if (!context.mounted) return;
    context.showSnack(
      failure == null ? 'Added to cart' : failure.message,
      isError: failure != null,
    );
  }

  Future<void> toggleWishlist(
    BuildContext context,
    String productId, {
    String? variantKey,
  }) async {
    final wasWishlisted = read(wishlistedIdsProvider).contains(productId);
    final failure =
        await read(wishlistControllerProvider.notifier).toggle(productId, variantKey: variantKey);
    if (!context.mounted) return;
    if (failure != null) {
      context.showSnack(failure.message, isError: true);
    } else {
      context.showSnack(wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    }
  }
}
