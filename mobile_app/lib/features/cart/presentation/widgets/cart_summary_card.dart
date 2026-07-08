import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../cart_controller.dart';

/// Price breakdown card used in cart and checkout.
class CartSummaryCard extends StatelessWidget {
  const CartSummaryCard({required this.summary, this.title = 'Order summary', super.key});

  final CartSummary summary;
  final String title;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: theme.textTheme.titleMedium),
            const SizedBox(height: AppSpacing.md),
            _row(theme, 'Subtotal', Formatters.rupees(summary.subtotal)),
            if (summary.savings > 0)
              _row(theme, 'Product discount', '- ${Formatters.rupees(summary.savings)}',
                  valueColor: AppColors.success),
            _row(theme, 'Tax (GST)', Formatters.rupees(summary.tax)),
            _row(
              theme,
              'Delivery',
              summary.shipping == 0 ? 'FREE' : Formatters.rupees(summary.shipping),
              valueColor: summary.shipping == 0 ? AppColors.success : null,
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
              child: Divider(),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: theme.textTheme.titleMedium),
                Text(Formatters.rupees(summary.total),
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              ],
            ),
            if (summary.savings > 0) ...[
              const SizedBox(height: AppSpacing.sm),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text(
                  'You save ${Formatters.rupees(summary.savings)} on this order',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.labelMedium?.copyWith(color: AppColors.success),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(ThemeData theme, String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
          Text(value, style: theme.textTheme.bodyMedium?.copyWith(color: valueColor)),
        ],
      ),
    );
  }
}
