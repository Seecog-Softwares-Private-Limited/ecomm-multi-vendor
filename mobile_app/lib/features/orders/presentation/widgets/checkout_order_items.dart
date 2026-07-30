import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../../commerce/presentation/widgets/price_hierarchy.dart';

/// Checkout order summary line items from session preview.
class CheckoutOrderItemsList extends StatelessWidget {
  const CheckoutOrderItemsList({required this.items, super.key});

  final List<Map<String, dynamic>> items;

  String? _imageUrl(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map) {
      return product['imageUrl']?.toString();
    }
    return item['imageUrl']?.toString();
  }

  String _name(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map && product['name'] != null) return product['name'].toString();
    return item['productName']?.toString() ?? 'Product';
  }

  double _price(Map<String, dynamic> item) {
    return (item['unitPrice'] as num?)?.toDouble() ??
        (item['sellingPrice'] as num?)?.toDouble() ??
        0;
  }

  double _mrp(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map) return (product['mrp'] as num?)?.toDouble() ?? _price(item);
    return (item['mrp'] as num?)?.toDouble() ?? _price(item);
  }

  String? _variant(Map<String, dynamic> item) {
    final key = item['variantKey']?.toString();
    if (key == null || key.isEmpty) return null;
    return key.replaceAll('|', ' · ').replaceAll(':', ': ');
  }

  String? _seller(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map) {
      final seller = product['sellerName']?.toString();
      if (seller != null && seller.isNotEmpty) return seller;
    }
    return item['sellerName']?.toString();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (items.isEmpty) {
      return Text('No items', style: theme.textTheme.bodyMedium);
    }

    return Column(
      children: [
        for (final item in items) ...[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppCachedImage(
                imageUrl: _imageUrl(item),
                width: 64,
                height: 64,
                fallbackLabel: _name(item),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _name(item),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    if (_variant(item) != null)
                      Text(
                        _variant(item)!,
                        style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textSecondary),
                      ),
                    if (_seller(item) != null)
                      Text(
                        'Sold by ${_seller(item)}',
                        style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textMuted),
                      ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Qty: ${(item['quantity'] as num?)?.toInt() ?? 1}',
                      style: theme.textTheme.labelSmall,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    PriceHierarchy(
                      sellingPrice: _price(item),
                      mrp: _mrp(item),
                      compact: true,
                    ),
                  ],
                ),
              ),
              Text(
                Formatters.rupees(
                  (item['lineTotal'] as num?)?.toDouble() ??
                      _price(item) * ((item['quantity'] as num?)?.toInt() ?? 1),
                ),
                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          if (item != items.last) const Divider(height: AppSpacing.xl),
        ],
      ],
    );
  }
}
