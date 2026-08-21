import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../domain/entities/order.dart';
import '../orders_providers.dart';

/// Premium vertical order tracking timeline.
class OrderTracker extends StatelessWidget {
  const OrderTracker({required this.status, required this.timeline, super.key});

  final String status;
  final List<OrderTimelineEvent> timeline;

  DateTime? _timeFor(String code) {
    for (final e in timeline) {
      if (e.status.toUpperCase() == code) return e.occurredAt;
    }
    return null;
  }

  int _currentIndex(String upper) {
    if (upper == 'PENDING_PAYMENT') return -1;
    if (upper == 'CANCELLED' || upper == 'RETURNED') return -2;
    final idx = kOrderProgress.indexOf(upper);
    return idx >= 0 ? idx : 0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final upper = status.toUpperCase();

    if (upper == 'CANCELLED' || upper == 'RETURNED') {
      final presentation = orderStatusPresentation(upper);
      final when = _timeFor(upper);
      return _TrackerCard(
        child: Row(
          children: [
            Icon(presentation.icon, color: presentation.color, size: 28),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('This order was ${presentation.label.toLowerCase()}',
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                  if (when != null)
                    Text(Formatters.dayMonthYear(when), style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final currentIndex = _currentIndex(upper);
    return _TrackerCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Tracking', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: AppSpacing.lg),
          for (var i = 0; i < kOrderProgress.length; i++)
            _Step(
              presentation: orderStatusPresentation(kOrderProgress[i]),
              time: _timeFor(kOrderProgress[i]),
              completed: i <= currentIndex,
              isCurrent: i == currentIndex,
              isLast: i == kOrderProgress.length - 1,
            ),
        ],
      ),
    );
  }
}

class _TrackerCard extends StatelessWidget {
  const _TrackerCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: context.adaptiveColors.border.withValues(alpha: 0.7)),
      ),
      child: child,
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({
    required this.presentation,
    required this.time,
    required this.completed,
    required this.isCurrent,
    required this.isLast,
  });

  final ({String label, Color color, IconData icon}) presentation;
  final DateTime? time;
  final bool completed;
  final bool isCurrent;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final activeColor = completed ? AppColors.primary : adaptive.border;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: completed ? AppColors.primary : theme.colorScheme.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: activeColor, width: 2),
                  boxShadow: isCurrent
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.25),
                            blurRadius: 8,
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  completed ? Icons.check : presentation.icon,
                  size: 16,
                  color: completed ? Colors.white : adaptive.textMuted,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: activeColor),
                ),
            ],
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    presentation.label,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w500,
                      color: completed ? adaptive.textPrimary : adaptive.textMuted,
                    ),
                  ),
                  if (time != null)
                    Text(Formatters.dayMonthYear(time!), style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
