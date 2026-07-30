import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../domain/entities/order.dart';
import '../orders_providers.dart';

class OrderListCard extends ConsumerWidget {
  const OrderListCard({
    required this.order,
    required this.onTap,
    this.onTrack,
    this.onBuyAgain,
    this.onReview,
    super.key,
  });

  final OrderSummary order;
  final VoidCallback onTap;
  final VoidCallback? onTrack;
  final VoidCallback? onBuyAgain;
  final VoidCallback? onReview;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final status = orderStatusPresentation(order.status);
    final category = orderStatusCategory(order.status);
    final badgeColor = switch (category) {
      'pending' => AppColors.warning,
      'processing' => AppColors.info,
      'shipped' => const Color(0xFF7C3AED),
      'delivered' => AppColors.success,
      'cancelled' => AppColors.error,
      _ => adaptive.textSecondary,
    };
    final preview = order.previewItems;
    final primary = preview.isNotEmpty ? preview.first : null;

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: adaptive.border.withValues(alpha: 0.7)),
        boxShadow: [
          BoxShadow(
            color: adaptive.shadow,
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(AppRadius.md),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _OrderThumbnails(items: preview),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    '#${order.id.substring(0, order.id.length.clamp(0, 8)).toUpperCase()}',
                                    style: theme.textTheme.labelMedium?.copyWith(color: adaptive.textMuted),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: badgeColor.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(AppRadius.sm),
                                    border: Border.all(color: badgeColor.withValues(alpha: 0.35)),
                                  ),
                                  child: Text(
                                    status.label,
                                    style: theme.textTheme.labelSmall?.copyWith(
                                      color: badgeColor,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (primary != null) ...[
                              const SizedBox(height: AppSpacing.sm),
                              Text(
                                primary.productName,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                              ),
                            ],
                            if (order.itemCount > 1) ...[
                              const SizedBox(height: 4),
                              Text(
                                '${order.itemCount} items',
                                style: theme.textTheme.bodySmall?.copyWith(color: adaptive.textMuted),
                              ),
                            ],
                            const SizedBox(height: AppSpacing.sm),
                            Row(
                              children: [
                                Text(
                                  Formatters.rupees(order.totalAmount),
                                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                                ),
                                const Spacer(),
                                Text(
                                  Formatters.dayMonthYear(order.createdAt),
                                  style: theme.textTheme.bodySmall?.copyWith(color: adaptive.textMuted),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (_hasActions(category)) ...[
              const SizedBox(height: AppSpacing.md),
              Divider(height: 1, color: adaptive.border),
              const SizedBox(height: AppSpacing.sm),
              _ContextActions(
                category: category,
                onViewDetails: onTap,
                onTrack: onTrack,
                onBuyAgain: onBuyAgain,
                onReview: onReview,
              ),
            ],
          ],
        ),
      ),
    );
  }

  bool _hasActions(String category) =>
      category == 'pending' ||
      category == 'shipped' ||
      category == 'delivered' ||
      category == 'cancelled';
}

class _ContextActions extends StatelessWidget {
  const _ContextActions({
    required this.category,
    required this.onViewDetails,
    this.onTrack,
    this.onBuyAgain,
    this.onReview,
  });

  final String category;
  final VoidCallback onViewDetails;
  final VoidCallback? onTrack;
  final VoidCallback? onBuyAgain;
  final VoidCallback? onReview;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.xs,
      children: switch (category) {
        'pending' => [
          _ActionChip(label: 'View Details', icon: Icons.visibility_outlined, onTap: onViewDetails),
        ],
        'shipped' => [
          if (onTrack != null)
            _ActionChip(label: 'Track Order', icon: Icons.local_shipping_outlined, onTap: onTrack!),
        ],
        'delivered' => [
          if (onBuyAgain != null)
            _ActionChip(label: 'Buy Again', icon: Icons.refresh, onTap: onBuyAgain!),
          if (onReview != null)
            _ActionChip(label: 'Rate & Review', icon: Icons.rate_review_outlined, onTap: onReview!),
        ],
        'cancelled' => [
          if (onBuyAgain != null)
            _ActionChip(label: 'Buy Again', icon: Icons.refresh, onTap: onBuyAgain!),
        ],
        _ => <Widget>[],
      },
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({required this.label, required this.icon, required this.onTap});

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          child: Container(
            constraints: const BoxConstraints(minHeight: 44),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              border: Border.all(color: adaptive.border),
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 16, color: AppColors.primary),
                const SizedBox(width: AppSpacing.xs),
                Text(label, style: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderThumbnails extends StatelessWidget {
  const _OrderThumbnails({required this.items});

  final List<OrderPreviewItem> items;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    if (items.isEmpty) {
      return Container(
        width: 96,
        height: 96,
        decoration: BoxDecoration(
          color: adaptive.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Icon(Icons.image_outlined, color: adaptive.textMuted, size: 32),
      );
    }
    return AppCachedImage(
      imageUrl: items.first.image,
      width: 96,
      height: 96,
      fallbackLabel: items.first.productName,
      borderRadius: BorderRadius.circular(AppRadius.md),
    );
  }
}
