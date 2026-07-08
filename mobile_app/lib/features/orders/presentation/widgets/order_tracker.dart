import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../domain/entities/order.dart';
import '../orders_providers.dart';

/// Vertical order-progress tracker with completed / current / pending states.
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final upper = status.toUpperCase();

    if (upper == 'CANCELLED' || upper == 'RETURNED') {
      final presentation = orderStatusPresentation(upper);
      final when = _timeFor(upper);
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              Icon(presentation.icon, color: presentation.color),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('This order was ${presentation.label.toLowerCase()}',
                        style: theme.textTheme.titleSmall),
                    if (when != null)
                      Text(Formatters.dayMonthYear(when), style: theme.textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    final currentIndex = kOrderProgress.indexOf(upper);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
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
      ),
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
    final activeColor = completed ? AppColors.primary : AppColors.border;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: completed ? AppColors.primary : Theme.of(context).colorScheme.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: activeColor, width: 2),
                ),
                child: Icon(
                  completed ? Icons.check : presentation.icon,
                  size: 15,
                  color: completed ? Colors.white : AppColors.textMuted,
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
                      color: completed ? null : AppColors.textMuted,
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
