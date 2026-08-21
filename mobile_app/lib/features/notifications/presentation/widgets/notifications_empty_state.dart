import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';

class NotificationsEmptyState extends StatelessWidget {
  const NotificationsEmptyState({
    this.filtered = false,
    super.key,
  });

  final bool filtered;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    adaptive.primarySurface,
                    adaptive.primarySurface.withValues(alpha: 0.45),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                filtered ? Icons.search_off_outlined : Icons.notifications_active_outlined,
                size: 56,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Text(
              filtered ? 'No matching notifications' : "You're all caught up!",
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              filtered
                  ? 'Try another search term or category filter.'
                  : "We'll notify you about orders, payments and important updates.",
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
            ),
            if (!filtered) ...[
              const SizedBox(height: AppSpacing.xl),
              AppButton(
                label: 'Continue Shopping',
                icon: Icons.storefront_outlined,
                expanded: false,
                onPressed: () => context.go(AppRoutes.home),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
