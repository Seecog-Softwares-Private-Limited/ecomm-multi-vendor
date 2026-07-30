import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Stock availability message for cart and product lines.
class StockLabel extends StatelessWidget {
  const StockLabel({
    required this.stock,
    required this.inStock,
    required this.listingPaused,
    super.key,
  });

  final int stock;
  final bool inStock;
  final bool listingPaused;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    late final String message;
    late final Color color;
    late final IconData icon;

    if (listingPaused || !inStock) {
      message = 'Out of Stock';
      color = AppColors.error;
      icon = Icons.cancel_outlined;
    } else if (stock > 0 && stock <= 5) {
      message = 'Only $stock left';
      color = AppColors.warning;
      icon = Icons.warning_amber_rounded;
    } else {
      message = 'In Stock';
      color = AppColors.success;
      icon = Icons.check_circle_outline;
    }

    return Semantics(
      label: message,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: AppSpacing.xs),
          Text(
            message,
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
