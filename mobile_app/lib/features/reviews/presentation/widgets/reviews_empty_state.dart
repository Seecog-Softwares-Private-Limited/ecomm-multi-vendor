import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';

class ReviewsEmptyState extends StatelessWidget {
  const ReviewsEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
      child: Column(
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: adaptive.primarySurface,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.rate_review_outlined, size: 44, color: AppColors.primary),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'No Reviews Yet',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Be the first customer to review this product.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Continue Shopping',
            icon: Icons.storefront_outlined,
            expanded: false,
            variant: AppButtonVariant.secondary,
            onPressed: () => context.go(AppRoutes.home),
          ),
        ],
      ),
    );
  }
}
