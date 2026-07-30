import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../app/routing/shell_navigation.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../catalog/domain/repositories/catalog_repository.dart';
import '../../../catalog/presentation/catalog_providers.dart';
import '../../../catalog/presentation/widgets/product_card.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';
import '../../domain/entities/cart_item.dart';
import '../cart_controller.dart';
import '../commerce_actions.dart';
import 'cart_item_card.dart';
import 'cart_skeleton.dart';

/// Premium empty cart with recommended products carousel.
class CartEmptyView extends ConsumerWidget {
  const CartEmptyView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final feed = ref.watch(homeFeedProvider(MenuType.deals));
    final wishlisted = ref.watch(wishlistedIdsProvider);

    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpacing.xxxl),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.xxl, AppSpacing.huge, AppSpacing.xxl, AppSpacing.lg),
          child: Column(
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      context.adaptiveColors.primarySurface,
                      context.adaptiveColors.primarySurface.withValues(alpha: 0.5),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.shopping_bag_outlined, size: 56, color: AppColors.primary),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Your cart is empty', style: theme.textTheme.headlineSmall),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Looks like you haven\'t added anything yet.\nExplore deals and fill your cart!',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(color: context.adaptiveColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.xl),
              AppButton(
                label: 'Continue Shopping',
                icon: Icons.storefront_outlined,
                expanded: false,
                onPressed: () => ShellNavigation.continueShopping(context, ref),
              ),
            ],
          ),
        ),
        feed.when(
          loading: () => const SizedBox(height: 320, child: CartCarouselSkeleton()),
          error: (_, _) => const SizedBox.shrink(),
          data: (products) {
            if (products.isEmpty) return const SizedBox.shrink();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.sm),
                  child: Text('Recommended for you', style: theme.textTheme.titleMedium),
                ),
                SizedBox(
                  height: 296,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    itemCount: products.length,
                    separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
                    itemBuilder: (context, i) {
                      final product = products[i];
                      return ProductCard(
                        product: product,
                        width: 168,
                        onTap: () => context.push(AppRoutes.productPath(product.slug)),
                        isWishlisted: wishlisted.contains(product.id),
                        onWishlistTap: () => ref.toggleWishlist(context, product.id),
                        onAddToCart: () => ref.addToCart(context, product.id),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}

/// Saved-for-later section shown below active cart items.
class SavedForLaterSection extends ConsumerWidget {
  const SavedForLaterSection({required this.items, super.key});

  final List<CartItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final notifier = ref.read(cartControllerProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xl, bottom: AppSpacing.sm),
          child: Text('Saved for later', style: theme.textTheme.titleMedium),
        ),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: CartItemCard(
              item: item,
              compact: true,
              showQuantityStepper: false,
              onMoveToCart: () async {
                final failure = await notifier.moveToCart(item);
                if (context.mounted && failure != null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(failure.message)),
                  );
                }
              },
            ),
          ),
      ],
    );
  }
}
