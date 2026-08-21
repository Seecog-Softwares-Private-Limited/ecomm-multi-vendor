import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../domain/review_summary.dart';

class ReviewsSortFilterBar extends StatelessWidget {
  const ReviewsSortFilterBar({
    required this.sort,
    required this.filter,
    required this.onSortChanged,
    required this.onFilterChanged,
    super.key,
  });

  final ReviewSortOption sort;
  final ReviewFilterOption filter;
  final ValueChanged<ReviewSortOption> onSortChanged;
  final ValueChanged<ReviewFilterOption> onFilterChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.sort, size: 18, color: adaptive.textMuted),
            const SizedBox(width: AppSpacing.xs),
            Text('Sort', style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600)),
            const Spacer(),
            _SortMenu(sort: sort, onChanged: onSortChanged),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final option in ReviewFilterOption.values)
                Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: FilterChip(
                    label: Text(option.label),
                    selected: filter == option,
                    onSelected: (_) => onFilterChanged(option),
                    showCheckmark: false,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SortMenu extends StatelessWidget {
  const _SortMenu({required this.sort, required this.onChanged});

  final ReviewSortOption sort;
  final ValueChanged<ReviewSortOption> onChanged;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    return Semantics(
      button: true,
      label: 'Sort reviews by ${sort.label}',
      child: PopupMenuButton<ReviewSortOption>(
        initialValue: sort,
        onSelected: onChanged,
        child: Container(
          constraints: const BoxConstraints(minHeight: 44),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            border: Border.all(color: adaptive.border),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(sort.label, style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(width: 4),
              const Icon(Icons.arrow_drop_down, size: 20),
            ],
          ),
        ),
        itemBuilder: (context) => ReviewSortOption.values
            .map(
              (option) => PopupMenuItem(
                value: option,
                child: Text(option.label),
              ),
            )
            .toList(),
      ),
    );
  }
}
