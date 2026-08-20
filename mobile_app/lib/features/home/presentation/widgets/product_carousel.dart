import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../cart/presentation/commerce_actions.dart';
import '../../../catalog/domain/entities/product.dart';
import '../../../catalog/domain/repositories/catalog_repository.dart';
import '../../../catalog/presentation/catalog_providers.dart';
import '../../../catalog/presentation/widgets/product_card.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';

/// Horizontally-scrolling product section backed by a curated feed.
class ProductCarousel extends ConsumerWidget {
  const ProductCarousel({
    required this.title,
    required this.menuType,
    required this.onProductTap,
    this.onSeeAll,
    this.accent,
    this.icon,
    super.key,
  });

  final String title;
  final MenuType? menuType;
  final void Function(Product product) onProductTap;
  final VoidCallback? onSeeAll;
  final Color? accent;
  final IconData? icon;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final feed = ref.watch(homeFeedProvider(menuType));
    final wishlisted = ref.watch(wishlistedIdsProvider);

    return feed.maybeWhen(
      orElse: () => const _CarouselSkeleton(),
      data: (products) {
        if (products.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm),
              child: Row(
                children: [
                  if (icon != null) ...[
                    Icon(icon, color: accent ?? AppColors.primary, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                  ],
                  Expanded(child: Text(title, style: theme.textTheme.titleMedium)),
                  if (onSeeAll != null)
                    TextButton(onPressed: onSeeAll, child: const Text('See all')),
                ],
              ),
            ),
            // Width 168 → square image 168 + padding/title/rating/price ≈ 286. 296 fits without excess empty space.
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
                    onTap: () => onProductTap(product),
                    isWishlisted: wishlisted.contains(product.id),
                    onWishlistTap: () => ref.toggleWishlist(context, product.id),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _CarouselSkeleton extends StatelessWidget {
  const _CarouselSkeleton();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 296,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: 4,
        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (_, _) => Container(
          width: 168,
          decoration: BoxDecoration(
            color: AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
        ),
      ),
    );
  }
}
