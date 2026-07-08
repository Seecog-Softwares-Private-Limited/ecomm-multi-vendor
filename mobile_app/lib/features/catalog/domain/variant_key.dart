import 'entities/product.dart';

/// Builds the backend `variantKey` (`Color:<v>|Size:<v>`, non-empty dims only,
/// Color before Size for stability). Returns null when neither is set.
String? buildVariantKey({String? color, String? size}) {
  final parts = <String>[];
  if (color != null && color.trim().isNotEmpty) parts.add('Color:${color.trim()}');
  if (size != null && size.trim().isNotEmpty) parts.add('Size:${size.trim()}');
  return parts.isEmpty ? null : parts.join('|');
}

extension SkuVariantSelection on List<SkuVariant> {
  List<String> get colors => map((v) => v.color)
      .whereType<String>()
      .where((c) => c.trim().isNotEmpty)
      .toSet()
      .toList(growable: false);

  List<String> get sizes => map((v) => v.size)
      .whereType<String>()
      .where((s) => s.trim().isNotEmpty)
      .toSet()
      .toList(growable: false);

  SkuVariant? match({String? color, String? size}) {
    for (final v in this) {
      final vc = (v.color ?? '').trim();
      final vs = (v.size ?? '').trim();
      if (vc == (color ?? '').trim() && vs == (size ?? '').trim()) return v;
    }
    return null;
  }
}
