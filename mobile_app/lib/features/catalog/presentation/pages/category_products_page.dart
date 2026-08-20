import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../cart/presentation/commerce_actions.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../catalog_providers.dart';
import '../product_filters.dart';
import '../widgets/filter_sheet.dart';
import '../widgets/paginated_product_grid.dart';

class CategoryProductsPage extends ConsumerStatefulWidget {
  const CategoryProductsPage({required this.slug, this.initialSubSlug, super.key});

  final String slug;
  final String? initialSubSlug;

  @override
  ConsumerState<CategoryProductsPage> createState() => _CategoryProductsPageState();
}

class _CategoryProductsPageState extends ConsumerState<CategoryProductsPage> {
  ProductFilters _filters = const ProductFilters();
  String? _activeSub;

  @override
  void initState() {
    super.initState();
    _activeSub = widget.initialSubSlug;
  }

  MenuType? get _menuType {
    for (final type in MenuType.values) {
      if (type.slug == widget.slug) return type;
    }
    return null;
  }

  String _prettifySlug(String slug) => slug
      .split('-')
      .where((w) => w.isNotEmpty)
      .map((w) => '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ');

  String _resolveTitle() {
    final menuType = _menuType;
    if (menuType != null) {
      return switch (menuType) {
        MenuType.deals => 'Flash Deals',
        MenuType.newArrivals => 'New Arrivals',
        MenuType.bestSellers => 'Best Sellers',
      };
    }
    final categories = ref.watch(categoriesProvider).value;
    final match = categories?.where((c) => c.slug == widget.slug).toList() ?? const [];
    if (match.isNotEmpty) return match.first.name;
    return _prettifySlug(widget.slug);
  }

  Future<void> _openFilters() async {
    final result = await showFilterSheet(context, _filters);
    if (result != null && mounted) setState(() => _filters = result);
  }

  @override
  Widget build(BuildContext context) {
    final menuType = _menuType;
    final repo = ref.read(catalogRepositoryProvider);
    final wishlisted = ref.watch(wishlistedIdsProvider);
    final tree = ref.watch(categoryTreeProvider).value;
    final categoryNode =
        tree?.where((c) => c.slug == widget.slug).toList() ?? const [];
    final subcategories =
        categoryNode.isNotEmpty ? categoryNode.first.subcategories : const [];

    return Scaffold(
      appBar: AppBar(
        title: Text(_resolveTitle()),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: AppSpacing.sm),
            child: Badge(
              isLabelVisible: _filters.activeCount > 0,
              label: Text('${_filters.activeCount}'),
              child: IconButton(onPressed: _openFilters, icon: const Icon(Icons.tune)),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          if (subcategories.isNotEmpty)
            SizedBox(
              height: 52,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.sm),
                    child: ChoiceChip(
                      label: const Text('All'),
                      selected: _activeSub == null,
                      onSelected: (_) => setState(() => _activeSub = null),
                    ),
                  ),
                  for (final sub in subcategories)
                    Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.sm),
                      child: ChoiceChip(
                        label: Text(sub.name),
                        selected: _activeSub == sub.slug,
                        onSelected: (_) => setState(() => _activeSub = sub.slug),
                      ),
                    ),
                ],
              ),
            ),
          Expanded(
            child: PaginatedProductGrid(
              key: ValueKey('cat-${widget.slug}-${_activeSub ?? ''}'),
              fetcher: (offset, limit) => repo.fetchProducts(
                categorySlug: menuType == null ? widget.slug : null,
                subCategorySlug: _activeSub,
                menuType: menuType,
                limit: limit,
                offset: offset,
              ),
              transform: _filters.apply,
              onProductTap: (p) => context.push(AppRoutes.productPath(p.slug)),
              isWishlisted: (p) => wishlisted.contains(p.id),
              onWishlistTap: (p) => ref.toggleWishlist(context, p.id),
              emptyTitle: 'No products here',
              emptyMessage: 'Try another category or adjust filters.',
            ),
          ),
        ],
      ),
    );
  }
}
