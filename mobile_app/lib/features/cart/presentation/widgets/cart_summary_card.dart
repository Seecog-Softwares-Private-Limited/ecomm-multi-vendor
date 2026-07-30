import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../cart_controller.dart';

/// Price breakdown card used in cart and checkout with premium styling.
class CartSummaryCard extends StatelessWidget {
  const CartSummaryCard({
    required this.summary,
    this.title = 'Price Details',
    this.compact = false,
    super.key,
  });

  final CartSummary summary;
  final String title;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final totalSavings = summary.savings + summary.couponDiscount;

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.7)),
      ),
      padding: EdgeInsets.all(compact ? AppSpacing.md : AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpacing.md),
          _row(theme, 'Items Total', Formatters.rupees(summary.subtotal)),
          if (summary.savings > 0)
            _row(theme, 'Discount', '- ${Formatters.rupees(summary.savings)}', valueColor: AppColors.success),
          _row(
            theme,
            'Delivery Charges',
            summary.shipping == 0 ? 'FREE' : Formatters.rupees(summary.shipping),
            valueColor: summary.shipping == 0 ? AppColors.success : null,
          ),
          if (summary.couponDiscount > 0)
            _row(
              theme,
              'Coupon Discount',
              '- ${Formatters.rupees(summary.couponDiscount)}',
              valueColor: AppColors.success,
            ),
          if (!compact) _row(theme, 'Tax (GST)', Formatters.rupees(summary.tax)),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
            child: Divider(),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Grand Total', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
              Text(
                Formatters.rupees(summary.total),
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              ),
            ],
          ),
          if (totalSavings > 0) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Text(
                'You saved ${Formatters.rupees(totalSavings)} on this order',
                textAlign: TextAlign.center,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _row(ThemeData theme, String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
          Text(value, style: theme.textTheme.bodyMedium?.copyWith(color: valueColor, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
