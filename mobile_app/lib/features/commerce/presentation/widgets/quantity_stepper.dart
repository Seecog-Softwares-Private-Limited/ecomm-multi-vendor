import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Accessible quantity stepper with 44dp touch targets.
class QuantityStepper extends StatelessWidget {
  const QuantityStepper({
    required this.quantity,
    required this.onChanged,
    this.min = 1,
    this.max = 99,
    super.key,
  });

  final int quantity;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: adaptive.border),
        borderRadius: BorderRadius.circular(AppRadius.md),
        color: adaptive.surfaceVariant.withValues(alpha: 0.35),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepButton(
            icon: Icons.remove,
            semanticLabel: 'Decrease quantity',
            enabled: quantity > min,
            onPressed: () => onChanged(quantity - 1),
          ),
          SizedBox(
            width: 36,
            child: Text(
              '$quantity',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          _StepButton(
            icon: Icons.add,
            semanticLabel: 'Increase quantity',
            enabled: quantity < max,
            onPressed: () => onChanged(quantity + 1),
          ),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.semanticLabel,
    required this.enabled,
    required this.onPressed,
  });

  final IconData icon;
  final String semanticLabel;
  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticLabel,
      enabled: enabled,
      child: SizedBox(
        width: 44,
        height: 44,
        child: IconButton(
          onPressed: enabled ? onPressed : null,
          icon: Icon(icon, size: 18),
          color: AppColors.primary,
          disabledColor: context.adaptiveColors.textMuted,
          splashRadius: 20,
        ),
      ),
    );
  }
}
