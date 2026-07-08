import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/entities/cart_item.dart';
import '../cart_controller.dart';
import '../widgets/cart_summary_card.dart';
import '../widgets/coupon_field.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(cartControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My Cart')),
      body: async.when(
        loading: () => const AppLoader(),
        error: (error, _) => ErrorStateView(
          message: 'Could not load your cart.',
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (state) {
          if (state.isEmpty && state.savedForLater.isEmpty) {
            return EmptyStateView(
              title: 'Your cart is empty',
              message: 'Add products to your cart to see them here.',
              icon: Icons.shopping_cart_outlined,
              actionLabel: 'Start shopping',
              onAction: () => context.go(AppRoutes.home),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(cartControllerProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                for (final item in state.items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: _CartItemTile(item: item),
                  ),
                if (state.items.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.sm),
                  CouponField(
                    appliedCode: state.couponCode,
                    onApply: (code) {
                      ref.read(cartControllerProvider.notifier).applyCoupon(code);
                      context.showSnack('Coupon "$code" will apply at checkout');
                    },
                    onRemove: () => ref.read(cartControllerProvider.notifier).clearCoupon(),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  CartSummaryCard(summary: state.summary),
                ],
                if (state.savedForLater.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.xl),
                  Text('Saved for later', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: AppSpacing.sm),
                  for (final item in state.savedForLater)
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: _SavedTile(item: item),
                    ),
                ],
                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: async.maybeWhen(
        data: (state) => state.isEmpty ? null : _CheckoutBar(total: state.summary.total),
        orElse: () => null,
      ),
    );
  }
}

class _CartItemTile extends ConsumerWidget {
  const _CartItemTile({required this.item});
  final CartItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final notifier = ref.read(cartControllerProvider.notifier);
    final product = item.product;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                InkWell(
                  onTap: () => context.push(AppRoutes.productPath(product.slug ?? product.id)),
                  child: AppCachedImage(
                    imageUrl: product.image,
                    width: 84,
                    height: 84,
                    fallbackLabel: product.name,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium),
                      if ((item.variantKey ?? '').isNotEmpty)
                        Text(item.variantKey!.replaceAll('|', '  ·  ').replaceAll(':', ': '),
                            style: theme.textTheme.labelSmall),
                      const SizedBox(height: AppSpacing.xs),
                      Row(
                        children: [
                          Text(Formatters.rupees(product.sellingPrice),
                              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                          if (product.hasDiscount) ...[
                            const SizedBox(width: AppSpacing.sm),
                            Text(Formatters.rupees(product.mrp),
                                style: theme.textTheme.labelSmall?.copyWith(
                                  decoration: TextDecoration.lineThrough,
                                  color: AppColors.textMuted,
                                )),
                          ],
                        ],
                      ),
                      if (product.listingPaused || !product.inStock)
                        Text('Currently unavailable',
                            style: theme.textTheme.labelSmall?.copyWith(color: AppColors.error)),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: AppSpacing.xl),
            Row(
              children: [
                _QuantityStepper(
                  quantity: item.quantity,
                  onChanged: (q) => notifier.setQuantity(item, q),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: () => notifier.saveForLater(item),
                  icon: const Icon(Icons.bookmark_border, size: 18),
                  label: const Text('Save'),
                ),
                TextButton.icon(
                  onPressed: () => notifier.remove(item),
                  icon: const Icon(Icons.delete_outline, size: 18),
                  label: const Text('Remove'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  const _QuantityStepper({required this.quantity, required this.onChanged});
  final int quantity;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            visualDensity: VisualDensity.compact,
            onPressed: quantity > 1 ? () => onChanged(quantity - 1) : null,
            icon: const Icon(Icons.remove, size: 18),
          ),
          Text('$quantity', style: Theme.of(context).textTheme.titleSmall),
          IconButton(
            visualDensity: VisualDensity.compact,
            onPressed: quantity < 99 ? () => onChanged(quantity + 1) : null,
            icon: const Icon(Icons.add, size: 18),
          ),
        ],
      ),
    );
  }
}

class _SavedTile extends ConsumerWidget {
  const _SavedTile({required this.item});
  final CartItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            AppCachedImage(
              imageUrl: item.product.image,
              width: 64,
              height: 64,
              fallbackLabel: item.product.name,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.product.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium),
                  Text(Formatters.rupees(item.product.sellingPrice),
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            TextButton(
              onPressed: () async {
                final failure = await ref.read(cartControllerProvider.notifier).moveToCart(item);
                if (context.mounted && failure != null) {
                  context.showSnack(failure.message, isError: true);
                }
              },
              child: const Text('Move to cart'),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckoutBar extends StatelessWidget {
  const _CheckoutBar({required this.total});
  final double total;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(top: BorderSide(color: theme.dividerColor)),
        ),
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Total', style: theme.textTheme.labelSmall),
                Text(Formatters.rupees(total),
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              ],
            ),
            const SizedBox(width: AppSpacing.lg),
            Expanded(
              child: AppButton(
                label: 'Checkout',
                icon: Icons.arrow_forward,
                onPressed: () => context.push(AppRoutes.checkout),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
