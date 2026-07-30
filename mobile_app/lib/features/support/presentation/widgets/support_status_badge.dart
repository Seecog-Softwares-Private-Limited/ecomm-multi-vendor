import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../domain/support_helpers.dart';

class SupportStatusBadge extends StatelessWidget {
  const SupportStatusBadge({required this.status, super.key});

  final String status;

  @override
  Widget build(BuildContext context) {
    final presentation = supportStatusPresentation(status);
    return Semantics(
      label: 'Status ${presentation.label}',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: presentation.color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(color: presentation.color.withValues(alpha: 0.35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(presentation.icon, size: 14, color: presentation.color),
            const SizedBox(width: 4),
            Text(
              presentation.label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: presentation.color,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class SupportReplyIndicator extends StatelessWidget {
  const SupportReplyIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Semantics(
      label: 'Support has replied',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: primary.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppRadius.pill),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 7,
              height: 7,
              decoration: BoxDecoration(
                color: primary,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              'Reply',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: primary,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
