import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Coupon entry / applied-coupon chip. The discount itself is validated and
/// applied by the backend at order placement.
class CouponField extends StatefulWidget {
  const CouponField({
    required this.appliedCode,
    required this.onApply,
    required this.onRemove,
    super.key,
  });

  final String? appliedCode;
  final ValueChanged<String> onApply;
  final VoidCallback onRemove;

  @override
  State<CouponField> createState() => _CouponFieldState();
}

class _CouponFieldState extends State<CouponField> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (widget.appliedCode != null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.success.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.success),
        ),
        child: Row(
          children: [
            const Icon(Icons.local_offer, color: AppColors.success, size: 18),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text('"${widget.appliedCode}" applied',
                  style: theme.textTheme.labelLarge?.copyWith(color: AppColors.success)),
            ),
            TextButton(onPressed: widget.onRemove, child: const Text('Remove')),
          ],
        ),
      );
    }
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _controller,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(
              hintText: 'Enter coupon code',
              prefixIcon: Icon(Icons.local_offer_outlined),
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        FilledButton(
          onPressed: () {
            final code = _controller.text.trim();
            if (code.isNotEmpty) widget.onApply(code);
          },
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            minimumSize: const Size(0, 52),
          ),
          child: const Text('Apply'),
        ),
      ],
    );
  }
}
