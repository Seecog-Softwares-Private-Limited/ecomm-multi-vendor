import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Coupon entry / applied-coupon chip.
///
/// Only show the green "applied" state when [appliedCode] is set **and**
/// [verified] is true (backend confirmed). Unverified codes must not look applied.
class CouponField extends StatefulWidget {
  const CouponField({
    required this.appliedCode,
    required this.onApply,
    required this.onRemove,
    this.verified = false,
    this.isApplying = false,
    super.key,
  });

  /// Verified applied code (show chip only when [verified] is true).
  final String? appliedCode;
  final bool verified;
  final bool isApplying;
  final Future<void> Function(String code) onApply;
  final VoidCallback onRemove;

  @override
  State<CouponField> createState() => _CouponFieldState();
}

class _CouponFieldState extends State<CouponField> {
  final TextEditingController _controller = TextEditingController();
  bool _localApplying = false;

  bool get _busy => widget.isApplying || _localApplying;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final code = _controller.text.trim();
    if (code.isEmpty || _busy) return;
    setState(() => _localApplying = true);
    try {
      await widget.onApply(code);
      if (mounted) _controller.clear();
    } finally {
      if (mounted) setState(() => _localApplying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (widget.appliedCode != null && widget.verified) {
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
              child: Text(
                '"${widget.appliedCode}" applied',
                style: theme.textTheme.labelLarge?.copyWith(color: AppColors.success),
              ),
            ),
            TextButton(onPressed: _busy ? null : widget.onRemove, child: const Text('Remove')),
          ],
        ),
      );
    }
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _controller,
            enabled: !_busy,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(
              hintText: 'Enter coupon code',
              prefixIcon: Icon(Icons.local_offer_outlined),
            ),
            onSubmitted: (_) => _submit(),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        FilledButton(
          onPressed: _busy ? null : _submit,
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            minimumSize: const Size(0, 52),
          ),
          child: _busy
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text('Apply'),
        ),
      ],
    );
  }
}
