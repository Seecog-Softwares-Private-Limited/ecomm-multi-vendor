import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';

enum SupportEmptyKind {
  tickets,
  faqs,
  search,
  messages,
}

/// Premium empty states for Help Center surfaces.
class SupportEmptyState extends StatelessWidget {
  const SupportEmptyState({
    required this.kind,
    this.onAction,
    this.actionLabel,
    super.key,
  });

  final SupportEmptyKind kind;
  final VoidCallback? onAction;
  final String? actionLabel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final config = switch (kind) {
      SupportEmptyKind.tickets => (
          icon: Icons.confirmation_number_outlined,
          title: 'No support tickets yet',
          message: 'Need help with an order or account? Create a ticket and our team will respond soon.',
          defaultAction: 'Create ticket',
          showShop: true,
        ),
      SupportEmptyKind.faqs => (
          icon: Icons.help_outline,
          title: 'No FAQs available',
          message: 'We could not find help articles right now. Try again shortly or contact support.',
          defaultAction: 'Contact support',
          showShop: true,
        ),
      SupportEmptyKind.search => (
          icon: Icons.search_off_outlined,
          title: 'No results found',
          message: 'Try a different keyword, or browse categories and your tickets.',
          defaultAction: null,
          showShop: false,
        ),
      SupportEmptyKind.messages => (
          icon: Icons.chat_bubble_outline,
          title: 'No messages yet',
          message: 'Describe your issue below and our support team will reply here.',
          defaultAction: null,
          showShop: false,
        ),
    };

    final label = actionLabel ?? config.defaultAction;

    return Semantics(
      label: config.title,
      child: Center(
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
                      adaptive.primarySurface.withValues(alpha: 0.4),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Icon(config.icon, size: 56, color: AppColors.primary),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                config.title,
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                config.message,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
              ),
              if (label != null && onAction != null) ...[
                const SizedBox(height: AppSpacing.xl),
                AppButton(
                  label: label,
                  icon: Icons.add_comment_outlined,
                  expanded: false,
                  onPressed: onAction,
                ),
              ],
              if (config.showShop) ...[
                const SizedBox(height: AppSpacing.md),
                AppButton(
                  label: 'Continue Shopping',
                  icon: Icons.storefront_outlined,
                  variant: AppButtonVariant.text,
                  expanded: false,
                  onPressed: () => context.go(AppRoutes.home),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
