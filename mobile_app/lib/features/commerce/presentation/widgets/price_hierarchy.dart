import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';

/// Selling price, strikethrough MRP, and discount badge.
class PriceHierarchy extends StatelessWidget {
  const PriceHierarchy({
    required this.sellingPrice,
    required this.mrp,
    this.compact = false,
    super.key,
  });

  final double sellingPrice;
  final double mrp;
  final bool compact;

  int get _discountPercent {
    if (mrp <= sellingPrice || mrp <= 0) return 0;
    return ((mrp - sellingPrice) / mrp * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final hasDiscount = _discountPercent > 0;

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.xs,
      children: [
        Text(
          Formatters.rupees(sellingPrice),
          style: (compact ? theme.textTheme.titleSmall : theme.textTheme.titleMedium)?.copyWith(
            fontWeight: FontWeight.w800,
            color: adaptive.textPrimary,
          ),
        ),
        if (hasDiscount) ...[
          Text(
            Formatters.rupees(mrp),
            style: theme.textTheme.bodySmall?.copyWith(
              decoration: TextDecoration.lineThrough,
              color: adaptive.textMuted,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.xs),
            ),
            child: Text(
              '$_discountPercent% OFF',
              style: theme.textTheme.labelSmall?.copyWith(
                color: AppColors.success,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
