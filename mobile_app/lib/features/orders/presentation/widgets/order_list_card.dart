import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../domain/entities/order.dart';
import '../orders_providers.dart';

class OrderListCard extends StatelessWidget {
  const OrderListCard({required this.order, required this.onTap, super.key});

  final OrderSummary order;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = orderStatusPresentation(order.status);
    final category = orderStatusCategory(order.status);
    final badgeColor = switch (category) {
      'pending' => AppColors.warning,
      'processing' => AppColors.info,
      'shipped' => const Color(0xFF7C3AED),
      'delivered' => AppColors.success,
      'cancelled' => AppColors.error,
      _ => AppColors.textSecondary,
    };
    final preview = order.previewItems;
    final primary = preview.isNotEmpty ? preview.first : null;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _OrderThumbnails(items: preview),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (primary != null)
                      Text(
                        primary.productName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                      ),
                    if (order.itemCount > 1) ...[
                      const SizedBox(height: 4),
                      Text(
                        '+${order.itemCount - 1} more item${order.itemCount - 1 == 1 ? '' : 's'}',
                        style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.sm),
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
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      Formatters.rupees(order.totalAmount),
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${Formatters.dayMonthYear(order.createdAt)} · #${order.id.substring(0, order.id.length.clamp(0, 8)).toUpperCase()}',
                      style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ],
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
    if (items.isEmpty) {
      return Container(
        width: 90,
        height: 90,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: const Icon(Icons.image_outlined, color: AppColors.textMuted),
      );
    }
    if (items.length == 1) {
      return AppCachedImage(
        imageUrl: items.first.image,
        width: 90,
        height: 90,
        fallbackLabel: items.first.productName,
        borderRadius: BorderRadius.circular(AppRadius.md),
      );
    }
    return SizedBox(
      width: 90,
      height: 90,
      child: Stack(
        children: [
          Positioned(
            left: 0,
            top: 8,
            child: AppCachedImage(
              imageUrl: items.first.image,
              width: 56,
              height: 56,
              fallbackLabel: items.first.productName,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
          if (items.length > 1)
            Positioned(
              right: 0,
              bottom: 8,
              child: AppCachedImage(
                imageUrl: items[1].image,
                width: 56,
                height: 56,
                fallbackLabel: items[1].productName,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
          if (items.length > 2)
            Positioned(
              right: 4,
              top: 4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text(
                  '+${items.length - 2}',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ),
            ),
        ],
      ),
    );
  }
}