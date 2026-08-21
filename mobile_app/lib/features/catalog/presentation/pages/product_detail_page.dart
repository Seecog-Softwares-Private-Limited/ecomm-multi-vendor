import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/config/env_config.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../../../core/di/providers.dart';
import '../../../orders/data/checkout_remote_data_source.dart';
import '../../../cart/presentation/commerce_actions.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';
import '../../../../core/error/failure.dart';
import '../../../auth/presentation/auth_controller.dart';
import '../../../reviews/presentation/reviews_providers.dart';
import '../../../reviews/presentation/widgets/product_reviews_section.dart';
import '../../../reviews/presentation/widgets/write_review_sheet.dart';
import '../../domain/entities/product.dart';
import '../../domain/variant_key.dart';
import '../catalog_providers.dart';
import '../widgets/product_card.dart';
import '../widgets/product_gallery.dart';
import '../widgets/rating_stars.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  const ProductDetailPage({
    required this.idOrSlug,
    this.openWriteReview = false,
    super.key,
  });

  final String idOrSlug;
  final bool openWriteReview;

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  String? _color;
  String? _size;
  bool _addingToCart = false;
  bool _buyingNow = false;
  bool _writeReviewHandled = false;
  bool _checkingReviewEligibility = false;
  final _reviewsSectionKey = GlobalKey<ProductReviewsSectionState>();
  final _reviewsScrollKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    if (widget.openWriteReview) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _scheduleWriteReviewFlow());
    }
  }

  void _scheduleWriteReviewFlow() {
    WidgetsBinding.instance.addPostFrameCallback((_) => _handleOpenWriteReview());
  }

  Future<void> _scrollToReviews() async {
    await Future<void>.delayed(const Duration(milliseconds: 100));
    if (!mounted) return;
    final target = _reviewsScrollKey.currentContext;
    if (target != null) {
      await Scrollable.ensureVisible(
        target,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOut,
        alignment: 0.05,
      );
    }
  }

  Future<void> _handleOpenWriteReview() async {
    if (_writeReviewHandled) return;
    final detail = ref.read(productDetailProvider(widget.idOrSlug)).value;
    if (detail == null) return;

    setState(() => _checkingReviewEligibility = true);
    try {
      final authed = ref.read(isAuthenticatedProvider);
      if (!mounted) return;
      if (!authed) {
        _writeReviewHandled = true;
        await _scrollToReviews();
        if (!context.mounted) return;
        context.showSnack('Please sign in to write a review.', isError: true);
        return;
      }

      final canReview = await ref.read(canReviewProductProvider(detail.id).future);
      if (!mounted) return;

      if (!canReview) {
        _writeReviewHandled = true;
        await _scrollToReviews();
        if (mounted) {
          context.showSnack('Browse reviews below. You can write one after your order is delivered.');
        }
        return;
      }

      final reviews = await ref.read(productReviewsListProvider(detail.id).future);
      if (!mounted) return;

      if (userAlreadyReviewed(reviews, currentUserDisplayName(ref))) {
        _writeReviewHandled = true;
        await _scrollToReviews();
        if (mounted) context.showSnack('You have already reviewed this product.');
        return;
      }

      _writeReviewHandled = true;
      await showWriteReviewSheet(
        context: context,
        ref: ref,
        productId: detail.id,
        productName: detail.name,
        idOrSlug: widget.idOrSlug,
      );
    } catch (error) {
      _writeReviewHandled = true;
      await _scrollToReviews();
      if (mounted) context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _checkingReviewEligibility = false);
    }
  }

  String? _variantKey(ProductDetail detail) =>
      detail.skuVariants.isEmpty ? null : buildVariantKey(color: _color, size: _size);

  SkuVariant? _selectedVariant(ProductDetail detail) =>
      detail.skuVariants.isEmpty ? null : detail.skuVariants.match(color: _color, size: _size);

  bool _selectionComplete(ProductDetail detail) {
    if (detail.skuVariants.isEmpty) return true;
    final needsColor = detail.skuVariants.colors.isNotEmpty;
    final needsSize = detail.skuVariants.sizes.isNotEmpty;
    if (needsColor && (_color == null)) return false;
    if (needsSize && (_size == null)) return false;
    return true;
  }

  Future<bool> _ensureAddable(ProductDetail detail) async {
    if (!_selectionComplete(detail)) {
      context.showSnack('Please select the product options first.', isError: true);
      return false;
    }
    final variant = _selectedVariant(detail);
    final stock = variant?.stock ?? detail.stock;
    if (stock <= 0) {
      context.showSnack('This item is currently out of stock.', isError: true);
      return false;
    }
    return true;
  }

  Future<void> _addToCart(ProductDetail detail) async {
    if (!await _ensureAddable(detail)) return;
    if (!mounted) return;
    setState(() => _addingToCart = true);
    await ref.addToCart(context, detail.id, variantKey: _variantKey(detail));
    if (mounted) setState(() => _addingToCart = false);
  }

  Future<void> _buyNow(ProductDetail detail) async {
    if (!await _ensureAddable(detail)) return;
    setState(() => _buyingNow = true);
    try {
      final ds = CheckoutRemoteDataSource(ref.read(dioClientProvider));
      final sessionId = await ds.createBuyNowSession(
        productId: detail.id,
        quantity: 1,
        variantKey: _variantKey(detail),
      );
      if (!mounted) return;
      if (sessionId.isEmpty) {
        context.showSnack('Could not start checkout.', isError: true);
        return;
      }
      context.push('${AppRoutes.checkout}?session=$sessionId');
    } catch (e) {
      if (mounted) {
        context.showSnack('Could not start checkout.', isError: true);
      }
    } finally {
      if (mounted) setState(() => _buyingNow = false);
    }
  }

  void _share(ProductDetail detail) {
    final url = '${EnvConfig.baseUrl}${AppRoutes.productPath(detail.slug)}';
    Clipboard.setData(ClipboardData(text: url));
    context.showSnack('Product link copied to clipboard');
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productDetailProvider(widget.idOrSlug));
    final wishlisted = ref.watch(wishlistedIdsProvider);

    ref.listen(productDetailProvider(widget.idOrSlug), (previous, next) {
      if (widget.openWriteReview && !_writeReviewHandled && next.hasValue) {
        _scheduleWriteReviewFlow();
      }
    });

    return Stack(
      children: [
        Scaffold(
          body: async.when(
            loading: () => const _DetailScaffold(child: AppLoader(message: 'Loading product…')),
            error: (error, _) => _DetailScaffold(
              child: ErrorStateView(
                message: 'We could not load this product.',
                onRetry: () => ref.invalidate(productDetailProvider(widget.idOrSlug)),
              ),
            ),
            data: (detail) => _buildContent(detail, wishlisted.contains(detail.id)),
          ),
          bottomNavigationBar: async.maybeWhen(
            data: (detail) => _buildBottomBar(detail),
            orElse: () => null,
          ),
        ),
        if (_checkingReviewEligibility) ...[
          ModalBarrier(dismissible: false, color: Colors.black.withValues(alpha: 0.35)),
          const Center(child: CircularProgressIndicator()),
        ],
      ],
    );
  }

  Widget _buildContent(ProductDetail detail, bool isWishlisted) {
    final theme = Theme.of(context);
    final variant = _selectedVariant(detail);
    final price = variant?.price ?? detail.price;
    final stock = variant?.stock ?? detail.stock;
    final images = (variant != null && variant.images.isNotEmpty)
        ? variant.images.map((e) => e).toList()
        : detail.resolvedImages;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          actions: [
            IconButton(
              onPressed: () => ref.toggleWishlist(context, detail.id),
              icon: Icon(
                isWishlisted ? Icons.favorite : Icons.favorite_border,
                color: isWishlisted ? AppColors.error : null,
              ),
            ),
            IconButton(onPressed: () => _share(detail), icon: const Icon(Icons.share_outlined)),
          ],
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ProductGallery(images: images, heroTag: 'product-${detail.id}'),
                const SizedBox(height: AppSpacing.lg),
                Text(detail.name, style: theme.textTheme.titleLarge),
                const SizedBox(height: AppSpacing.sm),
                if (detail.reviewCount > 0 || (detail.avgRating ?? 0) > 0)
                  Row(
                    children: [
                      RatingStars(rating: detail.avgRating ?? 0),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '${(detail.avgRating ?? 0).toStringAsFixed(1)} · ${detail.reviewCount} reviews',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      Formatters.rupees(price),
                      style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    if (detail.hasDiscount) ...[
                      Text(
                        Formatters.rupees(detail.mrp),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          decoration: TextDecoration.lineThrough,
                          color: context.adaptiveColors.textMuted,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '${detail.discountPercent}% off',
                        style: theme.textTheme.titleSmall?.copyWith(color: AppColors.success),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                _StockBadge(stock: stock),
                if (detail.skuVariants.colors.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.lg),
                  _VariantSelector(
                    label: 'Color',
                    options: detail.skuVariants.colors,
                    selected: _color,
                    onSelected: (value) => setState(() => _color = value),
                  ),
                ],
                if (detail.skuVariants.sizes.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.md),
                  _VariantSelector(
                    label: 'Size',
                    options: detail.skuVariants.sizes,
                    selected: _size,
                    onSelected: (value) => setState(() => _size = value),
                  ),
                ],
                const SizedBox(height: AppSpacing.lg),
                const _DeliveryInfo(),
                if ((detail.description ?? '').trim().isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.xl),
                  Text('Description', style: theme.textTheme.titleMedium),
                  const SizedBox(height: AppSpacing.sm),
                  Text(detail.description!.trim(), style: theme.textTheme.bodyMedium),
                ],
                if (detail.specifications.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.xl),
                  Text('Specifications', style: theme.textTheme.titleMedium),
                  const SizedBox(height: AppSpacing.sm),
                  _SpecTable(specs: detail.specifications),
                ],
              ],
            ),
          ),
        ),
        ProductReviewsSection(
          key: _reviewsSectionKey,
          scrollAnchorKey: _reviewsScrollKey,
          productId: detail.id,
          productName: detail.name,
          idOrSlug: widget.idOrSlug,
        ),
        _RelatedSection(productId: detail.id, currentId: detail.id),
        const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xl)),
      ],
    );
  }

  Widget _buildBottomBar(ProductDetail detail) {
    final variant = _selectedVariant(detail);
    final stock = variant?.stock ?? detail.stock;
    final outOfStock = stock <= 0;
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
        ),
        child: Row(
          children: [
            Expanded(
              child: AppButton(
                label: outOfStock ? 'Out of stock' : 'Add to cart',
                icon: Icons.add_shopping_cart,
                variant: AppButtonVariant.secondary,
                isLoading: _addingToCart,
                onPressed: outOfStock ? null : () => _addToCart(detail),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: AppButton(
                label: 'Buy now',
                isLoading: _buyingNow,
                onPressed: outOfStock ? null : () => _buyNow(detail),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailScaffold extends StatelessWidget {
  const _DetailScaffold({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(),
        Expanded(child: child),
      ],
    );
  }
}

class _StockBadge extends StatelessWidget {
  const _StockBadge({required this.stock});
  final int stock;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (stock <= 0) {
      return Text('Out of stock',
          style: theme.textTheme.titleSmall?.copyWith(color: AppColors.error));
    }
    if (stock <= 5) {
      return Text('Hurry, only $stock left!',
          style: theme.textTheme.titleSmall?.copyWith(color: AppColors.warning));
    }
    return Text('In stock', style: theme.textTheme.titleSmall?.copyWith(color: AppColors.success));
  }
}

class _VariantSelector extends StatelessWidget {
  const _VariantSelector({
    required this.label,
    required this.options,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final List<String> options;
  final String? selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            for (final option in options)
              ChoiceChip(
                label: Text(option),
                selected: selected == option,
                onSelected: (_) => onSelected(option),
              ),
          ],
        ),
      ],
    );
  }
}

class _DeliveryInfo extends StatelessWidget {
  const _DeliveryInfo();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    Widget row(IconData icon, String text) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Icon(icon, size: 18, color: AppColors.primary),
              const SizedBox(width: AppSpacing.sm),
              Expanded(child: Text(text, style: theme.textTheme.bodySmall)),
            ],
          ),
        );
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: adaptive.primarySurface,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        children: [
          row(Icons.local_shipping_outlined, 'Free delivery on all orders'),
          row(Icons.verified_outlined, 'Genuine products from verified sellers'),
          row(Icons.replay_outlined, '7-day easy returns on eligible items'),
        ],
      ),
    );
  }
}

class _SpecTable extends StatelessWidget {
  const _SpecTable({required this.specs});
  final List<SpecItem> specs;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        for (final spec in specs)
          Container(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: theme.dividerColor)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 130,
                  child: Text(spec.label,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: context.adaptiveColors.textSecondary,
                      )),
                ),
                Expanded(child: Text(spec.value, style: theme.textTheme.bodyMedium)),
              ],
            ),
          ),
      ],
    );
  }
}

class _RelatedSection extends ConsumerWidget {
  const _RelatedSection({required this.productId, required this.currentId});
  final String productId;
  final String currentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final related = ref.watch(relatedProductsProvider(productId));
    return SliverToBoxAdapter(
      child: related.maybeWhen(
        orElse: () => const SizedBox.shrink(),
        data: (products) {
          final items = products.where((p) => p.id != currentId).toList();
          if (items.isEmpty) return const SizedBox.shrink();
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm),
                child: Text('You may also like', style: theme.textTheme.titleMedium),
              ),
              SizedBox(
                height: 296,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
                  itemBuilder: (context, i) {
                    final product = items[i];
                    return ProductCard(
                      product: product,
                      width: 168,
                      onTap: () => context.push(AppRoutes.productPath(product.slug)),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
