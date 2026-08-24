import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Flipkart-style quantity selector: bordered "Qty: N ▾" that opens a sheet.
class QuantityDropdown extends StatelessWidget {
  const QuantityDropdown({
    required this.quantity,
    required this.onChanged,
    this.min = 1,
    this.max = 10,
    this.enabled = true,
    super.key,
  });

  final int quantity;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final bool enabled;

  Future<void> _openSheet(BuildContext context) async {
    final selected = await showModalBottomSheet<int>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (context) => _QuantitySheet(
        quantity: quantity,
        min: min,
        max: max < min ? min : max,
      ),
    );
    if (selected != null && selected != quantity) {
      onChanged(selected);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;

    return Semantics(
      button: true,
      label: 'Quantity $quantity',
      enabled: enabled,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? () => _openSheet(context) : null,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              border: Border.all(color: adaptive.border),
              color: adaptive.surfaceVariant.withValues(alpha: 0.35),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Qty: $quantity',
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: enabled ? adaptive.textPrimary : adaptive.textMuted,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 18,
                  color: enabled ? AppColors.primary : adaptive.textMuted,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QuantitySheet extends StatelessWidget {
  const _QuantitySheet({
    required this.quantity,
    required this.min,
    required this.max,
  });

  final int quantity;
  final int min;
  final int max;

  static const double _headerHeight = 48;
  static const double _rowHeight = 48;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final options = List<int>.generate(max - min + 1, (i) => min + i);
    final media = MediaQuery.of(context);

    // Cap sheet height so title + list never exceed the screen (incl. nav inset).
    final maxBodyHeight = (media.size.height * 0.45) - media.viewPadding.bottom;
    final intrinsic = _headerHeight + (options.length * _rowHeight);
    final bodyHeight = intrinsic.clamp(_headerHeight + _rowHeight, maxBodyHeight);

    return Padding(
      padding: EdgeInsets.only(bottom: media.viewPadding.bottom),
      child: SizedBox(
        height: bodyHeight,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: _headerHeight,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Select Quantity', style: theme.textTheme.titleMedium),
                ),
              ),
            ),
            Expanded(
              child: ListView.separated(
                itemCount: options.length,
                separatorBuilder: (_, _) => Divider(height: 1, color: adaptive.border),
                itemBuilder: (context, index) {
                  final value = options[index];
                  final selected = value == quantity;
                  return SizedBox(
                    height: _rowHeight,
                    child: InkWell(
                      onTap: () => Navigator.of(context).pop(value),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                '$value',
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                                  color: selected ? AppColors.primary : null,
                                ),
                              ),
                            ),
                            if (selected)
                              const Icon(Icons.check_circle, color: AppColors.primary),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
