import 'package:flutter/rendering.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/widgets/app_loading.dart';
import '../../../../core/design_system/widgets/app_offline_banner.dart';
import '../../../../core/design_system/widgets/app_state_views.dart';
import '../../../../core/design_system/widgets/product_card.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../providers/products_controller.dart';

const _loadMoreThreshold = 200.0;
final _listCacheExtent = ScrollCacheExtent.pixels(500);

class ProductsPage extends ConsumerStatefulWidget {
  const ProductsPage({super.key});

  @override
  ConsumerState<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends ConsumerState<ProductsPage> {
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!mounted || !_scrollController.hasClients) {
      return;
    }

    final position = _scrollController.position;
    if (!position.hasContentDimensions || position.maxScrollExtent <= 0) {
      return;
    }

    if (position.pixels >= position.maxScrollExtent - _loadMoreThreshold) {
      ref.read(productsControllerProvider.notifier).loadMore();
    }
  }

  int _columnsFor(BuildContext context) {
    return switch (context.deviceType) {
      DeviceType.phone => 2,
      DeviceType.tablet => 3,
      DeviceType.desktop => 4,
    };
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productsControllerProvider);
    final controller = ref.read(productsControllerProvider.notifier);
    final columns = _columnsFor(context);

    if (state.isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Products')),
        body: const AppSkeletonList(),
      );
    }

    if (state.errorMessage != null && state.items.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Products')),
        body: AppErrorState(
          title: 'Failed to load products',
          message: state.errorMessage!,
          onRetry: controller.loadInitial,
        ),
      );
    }

    if (state.items.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Products')),
        body: const AppEmptyState(
          title: 'No products found',
          message: 'Products will appear here once available.',
        ),
      );
    }

    final itemCount = state.items.length + (state.isLoadingMore ? columns : 0);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Products')),
      body: Column(
        children: [
          AppOfflineBanner(
            isOffline: state.isOffline,
            isFromCache: state.isFromCache,
          ),
          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: controller.loadInitial,
              child: GridView.builder(
                controller: _scrollController,
                scrollCacheExtent: _listCacheExtent,
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                padding: const EdgeInsets.all(AppSpacing.lg),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  mainAxisSpacing: AppSpacing.md,
                  crossAxisSpacing: AppSpacing.md,
                  childAspectRatio: 0.62,
                ),
                itemCount: itemCount,
                itemBuilder: (context, index) {
                  if (index >= state.items.length) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final product = state.items[index];
                  return ProductCard(
                    product: product,
                    heroTag: 'product-${product.id}',
                    onTap: () => context.push('detail', extra: product),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
