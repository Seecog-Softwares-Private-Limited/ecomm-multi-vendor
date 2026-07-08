import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';

class OrderSuccessPage extends StatelessWidget {
  const OrderSuccessPage({
    required this.orderId,
    required this.total,
    this.paymentPending = false,
    super.key,
  });

  final String orderId;
  final double total;
  final bool paymentPending;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeOutBack,
                  builder: (context, value, child) => Transform.scale(scale: value, child: child),
                  child: Container(
                    width: 110,
                    height: 110,
                    decoration: const BoxDecoration(color: AppColors.primarySurface, shape: BoxShape.circle),
                    child: const Icon(Icons.check_circle, color: AppColors.success, size: 72),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text('Order placed!', style: theme.textTheme.headlineSmall),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  paymentPending
                      ? 'Your order is confirmed. Complete the online payment to speed up dispatch.'
                      : 'Thank you for shopping with us. Your order is confirmed.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: AppSpacing.xl),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      children: [
                        _row(theme, 'Order ID', '#${orderId.substring(0, orderId.length.clamp(0, 8)).toUpperCase()}'),
                        const SizedBox(height: AppSpacing.sm),
                        _row(theme, 'Amount paid', Formatters.rupees(total)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                AppButton(
                  label: 'Track order',
                  icon: Icons.local_shipping_outlined,
                  onPressed: () => context.pushReplacement(AppRoutes.orderPath(orderId)),
                ),
                const SizedBox(height: AppSpacing.sm),
                AppButton(
                  label: 'Continue shopping',
                  variant: AppButtonVariant.text,
                  onPressed: () => context.go(AppRoutes.home),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _row(ThemeData theme, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
        Text(value, style: theme.textTheme.titleSmall),
      ],
    );
  }
}
