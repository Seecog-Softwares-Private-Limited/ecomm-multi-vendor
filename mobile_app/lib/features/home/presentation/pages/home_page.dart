import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../auth/presentation/auth_controller.dart';
import '../../../cart/presentation/commerce_actions.dart';
import '../../../catalog/domain/entities/product.dart';
import '../../../catalog/domain/repositories/catalog_repository.dart';
import '../../../catalog/presentation/catalog_providers.dart';
import '../../../catalog/presentation/widgets/paginated_product_grid.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';
import '../../../notifications/presentation/widgets/notification_icon_button.dart';
import '../widgets/banner_carousel.dart';
import '../widgets/category_strip.dart';
import '../widgets/home_search_bar.dart';
import '../widgets/product_carousel.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  void _openProduct(BuildContext context, Product product) =>
      context.push(AppRoutes.productPath(product.slug));

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).value?.user;
    final wishlisted = ref.watch(wishlistedIdsProvider);
    final repo = ref.read(catalogRepositoryProvider);

    final header = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
          child: HomeSearchBar(onTap: () => context.push(AppRoutes.search)),
        ),
        const SizedBox(height: AppSpacing.xs),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: BannerCarousel(onTap: () => context.push('${AppRoutes.category}/deals')),
        ),
        const SizedBox(height: AppSpacing.lg),
        _SectionLabel('Shop by category', onSeeAll: () => context.go(AppRoutes.categories)),
        const SizedBox(height: AppSpacing.sm),
        CategoryStrip(
          onCategoryTap: (category) => context.push(AppRoutes.categoryPath(category.slug)),
        ),
        ProductCarousel(
          title: 'Flash Deals',
          icon: Icons.local_fire_department,
          accent: AppColors.accentDark,
          menuType: MenuType.deals,
          onProductTap: (p) => _openProduct(context, p),
          onSeeAll: () => context.push('${AppRoutes.category}/deals'),
        ),
        ProductCarousel(
          title: 'New Arrivals',
          icon: Icons.auto_awesome,
          menuType: MenuType.newArrivals,
          onProductTap: (p) => _openProduct(context, p),
        ),
        ProductCarousel(
          title: 'Best Sellers',
          icon: Icons.trending_up,
          menuType: MenuType.bestSellers,
          onProductTap: (p) => _openProduct(context, p),
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xs),
          child: Text('Recommended for you'),
        ),
      ],
    );

    return Scaffold(
      appBar: AppBar(
        titleSpacing: AppSpacing.lg,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, ${user?.firstName ?? 'there'}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            Text(
              'What are you shopping today?',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
        actions: [
          NotificationIconButton(onPressed: () => context.push(AppRoutes.notifications)),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: PaginatedProductGrid(
        header: header,
        fetcher: (offset, limit) => repo.fetchProducts(limit: limit, offset: offset),
        onProductTap: (p) => _openProduct(context, p),
        isWishlisted: (p) => wishlisted.contains(p.id),
        onWishlistTap: (p) => ref.toggleWishlist(context, p.id),
        onAddToCart: (p) => ref.addToCart(context, p.id),
        emptyTitle: 'Nothing here yet',
        emptyMessage: 'Products will appear here once sellers add them.',
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.title, {this.onSeeAll});

  final String title;
  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, 0),
      child: Row(
        children: [
          Expanded(child: Text(title, style: Theme.of(context).textTheme.titleMedium)),
          if (onSeeAll != null) TextButton(onPressed: onSeeAll, child: const Text('See all')),
        ],
      ),
    );
  }
}
