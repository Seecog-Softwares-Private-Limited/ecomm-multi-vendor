import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../product_filters.dart';

/// Opens the sort & filter bottom sheet. Returns the updated filters, or null
/// if dismissed without applying.
Future<ProductFilters?> showFilterSheet(BuildContext context, ProductFilters current) {
  return showModalBottomSheet<ProductFilters>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => _FilterSheet(initial: current),
  );
}

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({required this.initial});

  final ProductFilters initial;

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late ProductSort _sort = widget.initial.sort;
  late double _minRating = widget.initial.minRating;
  late final TextEditingController _minPrice =
      TextEditingController(text: widget.initial.minPrice?.toStringAsFixed(0) ?? '');
  late final TextEditingController _maxPrice =
      TextEditingController(text: widget.initial.maxPrice?.toStringAsFixed(0) ?? '');

  @override
  void dispose() {
    _minPrice.dispose();
    _maxPrice.dispose();
    super.dispose();
  }

  void _apply() {
    final min = double.tryParse(_minPrice.text.trim());
    final max = double.tryParse(_maxPrice.text.trim());
    Navigator.of(context).pop(
      ProductFilters(minPrice: min, maxPrice: max, minRating: _minRating, sort: _sort),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        bottom: MediaQuery.viewInsetsOf(context).bottom + AppSpacing.lg,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Sort & Filter', style: theme.textTheme.titleLarge),
            const SizedBox(height: AppSpacing.lg),
            Text('Sort by', style: theme.textTheme.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final option in ProductSort.values)
                  ChoiceChip(
                    label: Text(option.label),
                    selected: _sort == option,
                    onSelected: (_) => setState(() => _sort = option),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Price range', style: theme.textTheme.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(child: _priceField(_minPrice, 'Min ₹')),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  child: Text('—'),
                ),
                Expanded(child: _priceField(_maxPrice, 'Max ₹')),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Customer rating', style: theme.textTheme.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              children: [
                for (final r in [4.0, 3.0, 2.0])
                  ChoiceChip(
                    avatar: const Icon(Icons.star, size: 16, color: AppColors.rating),
                    label: Text('${r.toStringAsFixed(0)}+'),
                    selected: _minRating == r,
                    onSelected: (sel) => setState(() => _minRating = sel ? r : 0),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Clear',
                    variant: AppButtonVariant.secondary,
                    onPressed: () => Navigator.of(context).pop(const ProductFilters()),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(child: AppButton(label: 'Apply', onPressed: _apply)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceField(TextEditingController controller, String label) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      decoration: InputDecoration(labelText: label),
    );
  }
}
