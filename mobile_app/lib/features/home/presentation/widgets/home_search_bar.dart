import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Non-editable search entry point on the home screen; tapping opens search.
class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({required this.onTap, super.key});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Material(
      color: theme.colorScheme.surface,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(color: adaptive.border),
          ),
          child: Row(
            children: [
              Icon(Icons.search, color: adaptive.textMuted),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  'Search for products, brands and more',
                  style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textMuted),
                ),
              ),
              Icon(Icons.mic_none, color: adaptive.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}
