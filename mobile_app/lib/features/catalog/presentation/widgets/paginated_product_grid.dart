import 'package:flutter/material.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/entities/product.dart';
import 'product_card.dart';

/// A scrollable, paginated product grid with pull-to-refresh, infinite scroll
/// and loading / empty / error states. Filtering & sorting are applied through
/// [transform] on the already-fetched items (no refetch needed).
class PaginatedProductGrid extends StatefulWidget {
  const PaginatedProductGrid({
    required this.fetcher,
    required this.onProductTap,
    this.isWishlisted,
    this.onWishlistTap,
    this.onAddToCart,
    this.transform,
    this.header,
    this.pageSize = 12,
    this.emptyTitle = 'No products found',
    this.emptyMessage = 'Try changing your filters or check back later.',
    super.key,
  });

  final Future<List<Product>> Function(int offset, int limit) fetcher;
  final void Function(Product product) onProductTap;
  final bool Function(Product product)? isWishlisted;
  final void Function(Product product)? onWishlistTap;
  final void Function(Product product)? onAddToCart;
  final List<Product> Function(List<Product> items)? transform;
  final Widget? header;
  final int pageSize;
  final String emptyTitle;
  final String emptyMessage;

  @override
  State<PaginatedProductGrid> createState() => _PaginatedProductGridState();
}

class _PaginatedProductGridState extends State<PaginatedProductGrid> {
  final ScrollController _scrollController = ScrollController();
  final List<Product> _items = [];

  bool _initialLoading = true;
  bool _loadingMore = false;
  bool _hasMore = true;
  Failure? _failure;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitial();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 400) {
      _loadMore();
    }
  }

  Future<void> _loadInitial() async {
    setState(() {
      _initialLoading = true;
      _failure = null;
    });
    try {
      final page = await widget.fetcher(0, widget.pageSize);
      if (!mounted) return;
      setState(() {
        _items
          ..clear()
          ..addAll(page);
        _hasMore = page.length >= widget.pageSize;
        _initialLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _failure = Failure.from(error);
        _initialLoading = false;
      });
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || !_hasMore || _initialLoading) return;
    setState(() => _loadingMore = true);
    try {
      final page = await widget.fetcher(_items.length, widget.pageSize);
      if (!mounted) return;
      setState(() {
        _items.addAll(page);
        _hasMore = page.length >= widget.pageSize;
        _loadingMore = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _hasMore = false;
        _loadingMore = false;
      });
    }
  }

  Future<void> _refresh() => _loadInitial();

  @override
  Widget build(BuildContext context) {
    final display = widget.transform?.call(_items) ?? _items;

    if (_initialLoading) {
      return _wrapHeader(const SizedBox(height: 360, child: AppLoader(message: 'Loading products…')));
    }

    if (_failure != null && _items.isEmpty) {
      return _wrapHeader(
        SizedBox(
          height: 360,
          child: ErrorStateView(message: _failure!.message, onRetry: _loadInitial),
        ),
      );
    }

    if (display.isEmpty) {
      return RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          controller: _scrollController,
          children: [
            if (widget.header != null) widget.header!,
            SizedBox(
              height: 360,
              child: EmptyStateView(
                title: widget.emptyTitle,
                message: widget.emptyMessage,
                icon: Icons.search_off,
              ),
            ),
          ],
        ),
      );
    }

    final columns = context.gridColumns;
    return RefreshIndicator(
      onRefresh: _refresh,
      child: CustomScrollView(
        controller: _scrollController,
        slivers: [
          if (widget.header != null) SliverToBoxAdapter(child: widget.header!),
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            sliver: SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                mainAxisSpacing: AppSpacing.lg,
                crossAxisSpacing: AppSpacing.lg,
                childAspectRatio: 0.62,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final product = display[index];
                  return ProductCard(
                    product: product,
                    onTap: () => widget.onProductTap(product),
                    isWishlisted: widget.isWishlisted?.call(product) ?? false,
                    onWishlistTap: widget.onWishlistTap == null
                        ? null
                        : () => widget.onWishlistTap!(product),
                    onAddToCart: widget.onAddToCart == null
                        ? null
                        : () => widget.onAddToCart!(product),
                  );
                },
                childCount: display.length,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
              child: Center(
                child: _loadingMore
                    ? const Padding(
                        padding: EdgeInsets.all(AppSpacing.lg),
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2.4),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _wrapHeader(Widget child) {
    if (widget.header == null) return child;
    return ListView(children: [widget.header!, child]);
  }
}
