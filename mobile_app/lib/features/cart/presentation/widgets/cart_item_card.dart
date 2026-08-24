import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../commerce/presentation/widgets/premium_card.dart';
import '../../../commerce/presentation/widgets/price_hierarchy.dart';
import '../../../commerce/presentation/widgets/quantity_stepper.dart';
import '../../../commerce/presentation/widgets/stock_label.dart';
import '../../domain/entities/cart_item.dart';
import '../cart_controller.dart';
import '../commerce_actions.dart';

/// Premium cart line item with swipe-to-remove, wishlist, and save-for-later.
class CartItemCard extends ConsumerWidget {
  const CartItemCard({
    required this.item,
    this.compact = false,
    this.showQuantityStepper = true,
    this.onMoveToCart,
    super.key,
  });

  final CartItem item;
  final bool compact;
  final bool showQuantityStepper;
  final VoidCallback? onMoveToCart;

  String get _variantLabel {
    final key = item.variantKey;
    if (key == null || key.isEmpty) return '';
    return key.replaceAll('|', '  ·  ').replaceAll(':', ': ');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final product = item.product;
    final notifier = ref.read(cartControllerProvider.notifier);
    final imageSize = compact ? 72.0 : 100.0;

    Widget card = PremiumCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                label: 'View ${product.name}',
                button: true,
                child: InkWell(
                  onTap: () => context.push(AppRoutes.productPath(product.slug ?? product.id)),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: AppCachedImage(
                    imageUrl: product.image,
                    width: imageSize,
                    height: imageSize,
                    fallbackLabel: product.name,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    if (_variantLabel.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        _variantLabel,
                        style: theme.textTheme.labelSmall?.copyWith(color: adaptive.textSecondary),
                      ),
                    ],
                    if (product.sellerName != null && product.sellerName!.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        'Sold by ${product.sellerName}',
                        style: theme.textTheme.labelSmall?.copyWith(color: adaptive.textMuted),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.sm),
                    PriceHierarchy(
                      sellingPrice: product.sellingPrice,
                      mrp: product.mrp,
                      compact: compact,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    StockLabel(
                      stock: product.stock,
                      inStock: product.inStock,
                      listingPaused: product.listingPaused,
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (showQuantityStepper || onMoveToCart != null) ...[
            const SizedBox(height: AppSpacing.md),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                if (showQuantityStepper)
                  QuantityStepper(
                    quantity: item.quantity,
                    onChanged: (q) => notifier.setQuantity(item, q),
                  )
                else if (onMoveToCart != null)
                  _ActionChip(
                    icon: Icons.shopping_cart_outlined,
                    label: 'Move to cart',
                    onTap: onMoveToCart!,
                  ),
                const Spacer(),
                if (showQuantityStepper) ...[
                  _ActionChip(
                    icon: Icons.favorite_border,
                    label: 'Wishlist',
                    onTap: () => ref.toggleWishlist(context, item.productId, variantKey: item.variantKey),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  _ActionChip(
                    icon: Icons.bookmark_border,
                    label: 'Save',
                    onTap: () => notifier.saveForLater(item),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  _ActionChip(
                    icon: Icons.delete_outline,
                    label: 'Remove',
                    color: AppColors.error,
                    onTap: () => notifier.remove(item),
                  ),
                ] else if (onMoveToCart != null) ...[
                  _ActionChip(
                    icon: Icons.delete_outline,
                    label: 'Remove',
                    color: AppColors.error,
                    onTap: () async {
                      await notifier.remove(item);
                      if (context.mounted) {
                        context.showSnack('Item removed from saved list');
                      }
                    },
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );

    if (!showQuantityStepper) return card;

    return Dismissible(
      key: Key('cart-${item.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppSpacing.lg),
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: const Icon(Icons.delete_outline, color: AppColors.error),
      ),
      confirmDismiss: (_) async {
        await notifier.remove(item);
        if (context.mounted) context.showSnack('Item removed from cart');
        return false;
      },
      child: card,
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? context.adaptiveColors.textSecondary;
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: effectiveColor),
              const SizedBox(height: 2),
              Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: effectiveColor)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Sticky bottom checkout bar with savings highlight.
class CartStickySummary extends StatelessWidget {
  const CartStickySummary({
    required this.summary,
    required this.itemCount,
    required this.onCheckout,
    super.key,
  });

  final CartSummary summary;
  final int itemCount;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final totalSavings = summary.savings + summary.couponDiscount;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.md),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: adaptive.shadow,
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (totalSavings > 0)
              Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: Text(
                  'You saved ${Formatters.rupees(totalSavings)}',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: AppColors.success,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '$itemCount item${itemCount == 1 ? '' : 's'}',
                        style: theme.textTheme.labelSmall?.copyWith(color: adaptive.textMuted),
                      ),
                      Text(
                        Formatters.rupees(summary.total),
                        style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: AppButton(
                    label: 'Checkout',
                    icon: Icons.arrow_forward,
                    onPressed: onCheckout,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
