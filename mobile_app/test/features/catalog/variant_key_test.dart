import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/catalog/domain/entities/product.dart';
import 'package:indovyapar_customer/features/catalog/domain/variant_key.dart';

void main() {
  group('buildVariantKey', () {
    test('returns null when neither dimension is set', () {
      expect(buildVariantKey(), isNull);
      expect(buildVariantKey(color: '', size: '  '), isNull);
    });

    test('emits Color before Size and trims values', () {
      expect(buildVariantKey(color: ' Blue ', size: ' L '), 'Color:Blue|Size:L');
    });

    test('emits only the provided dimension', () {
      expect(buildVariantKey(color: 'Red'), 'Color:Red');
      expect(buildVariantKey(size: 'XL'), 'Size:XL');
    });
  });

  group('SkuVariantSelection', () {
    final variants = <SkuVariant>[
      const SkuVariant(id: '1', color: 'Red', size: 'S', price: 100, stock: 2),
      const SkuVariant(id: '2', color: 'Red', size: 'M', price: 100, stock: 0),
      const SkuVariant(id: '3', color: 'Blue', size: 'S', price: 120, stock: 5),
      const SkuVariant(id: '4', color: '', size: 'L', price: 90, stock: 1),
    ];

    test('colors are unique and exclude blanks', () {
      expect(variants.colors, ['Red', 'Blue']);
    });

    test('sizes are unique and exclude blanks', () {
      expect(variants.sizes, ['S', 'M', 'L']);
    });

    test('match finds the exact color/size combination', () {
      final match = variants.match(color: 'Blue', size: 'S');
      expect(match?.id, '3');
    });

    test('match returns null when no combination matches', () {
      expect(variants.match(color: 'Green', size: 'S'), isNull);
    });
  });
}
