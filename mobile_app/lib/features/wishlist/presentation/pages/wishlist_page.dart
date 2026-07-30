import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../app/routing/shell_navigation.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../../cart/presentation/cart_controller.dart';
import '../../domain/entities/wishlist_item.dart';
import '../wishlist_controller.dart';

class WishlistPage extends ConsumerWidget {
  const WishlistPage({super.key});

  Future<void> _moveToCart(BuildContext context, WidgetRef ref, WishlistItem item) async {
    final failure = await ref
        .read(cartControllerProvider.notifier)
        .add(item.productId, variantKey: item.variantKey);
    if (!context.mounted) return;
    if (failure != null) {
      context.showSnack(failure.message, isError: true);
      return;
    }
    await ref.read(wishlistControllerProvider.notifier).removeItem(item);
    if (context.mounted) context.showSnack('Moved to cart');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(wishlistControllerProvider);
    return ShellTabBackScope(
      child: Scaffold(
        appBar: AppBar(
          leading: const ShellTabBackButton(),
          automaticallyImplyLeading: false,
          title: const Text('Wishlist'),
        actions: [
          if (async.value?.isNotEmpty ?? false)
            TextButton(
              onPressed: () async {
                await ref.read(wishlistControllerProvider.notifier).clearAll();
                if (context.mounted) context.showSnack('Wishlist cleared');
              },
              child: const Text('Clear'),
            ),
        ],
      ),
      body: async.when(
        loading: () => const AppLoader(),
        error: (error, _) => ErrorStateView(
          message: 'Could not load your wishlist.',
          onRetry: () => ref.invalidate(wishlistControllerProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return EmptyStateView(
              title: 'Your wishlist is empty',
              message: 'Tap the heart on any product to save it here.',
              icon: Icons.favorite_border,
              actionLabel: 'Start shopping',
              onAction: () => ShellNavigation.continueShopping(context, ref),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(wishlistControllerProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, i) {
                final item = items[i];
                return _WishlistTile(
                  item: item,
                  onTap: () => context.push(AppRoutes.productPath(item.productId)),
                  onRemove: () => ref.read(wishlistControllerProvider.notifier).removeItem(item),
                  onMoveToCart: item.product.inStock ? () => _moveToCart(context, ref, item) : null,
                );
              },
            ),
          );
        },
      ),
      ),
    );
  }
}

class _WishlistTile extends StatelessWidget {
  const _WishlistTile({
    required this.item,
    required this.onTap,
    required this.onRemove,
    required this.onMoveToCart,
  });

  final WishlistItem item;
  final VoidCallback onTap;
  final VoidCallback onRemove;
  final VoidCallback? onMoveToCart;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final product = item.product;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            InkWell(
              onTap: onTap,
              child: AppCachedImage(
                imageUrl: product.image,
                width: 90,
                height: 90,
                fallbackLabel: product.name,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  InkWell(
                    onTap: onTap,
                    child: Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      Text(Formatters.rupees(product.sellingPrice),
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                      if (product.hasDiscount) ...[
                        const SizedBox(width: AppSpacing.sm),
                        Text(Formatters.rupees(product.mrp),
                            style: theme.textTheme.bodySmall?.copyWith(
                              decoration: TextDecoration.lineThrough,
                              color: context.adaptiveColors.textMuted,
                            )),
                      ],
                    ],
                  ),
                  if (!product.inStock)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text('Out of stock',
                          style: theme.textTheme.labelMedium?.copyWith(color: AppColors.error)),
                    ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        onPressed: onMoveToCart,
                        style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                        icon: const Icon(Icons.add_shopping_cart, size: 16),
                        label: const Text('Move to cart'),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: onRemove,
                        icon: Icon(Icons.delete_outline, color: context.adaptiveColors.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
