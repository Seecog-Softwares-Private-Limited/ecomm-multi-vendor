import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/products/data/models/product_model.dart';

void main() {
  group('ProductModel', () {
    test('fromMap parses complete payload', () {
      final model = ProductModel.fromMap({
        'id': '42',
        'title': 'Wireless Headphones',
        'price': 1299.5,
        'stock': 12,
        'imageUrl': 'https://example.com/headphones.png',
      });

      expect(model.id, '42');
      expect(model.title, 'Wireless Headphones');
      expect(model.price, 1299.5);
      expect(model.stock, 12);
      expect(model.imageUrl, 'https://example.com/headphones.png');
    });

    test('fromMap applies defaults for missing fields', () {
      final model = ProductModel.fromMap({});

      expect(model.id, '');
      expect(model.title, 'Untitled Product');
      expect(model.price, 0);
      expect(model.stock, 0);
      expect(model.imageUrl, '');
    });

    test('toMap round-trips through fromMap', () {
      const model = ProductModel(
        id: 'p1',
        title: 'Sample',
        price: 499,
        stock: 3,
        imageUrl: 'https://example.com/p1.png',
      );

      final restored = ProductModel.fromMap(model.toMap());

      expect(restored.id, model.id);
      expect(restored.title, model.title);
      expect(restored.price, model.price);
      expect(restored.stock, model.stock);
      expect(restored.imageUrl, model.imageUrl);
    });

    test('toEntity maps to domain entity', () {
      const model = ProductModel(
        id: 'p2',
        title: 'Desk Lamp',
        price: 799,
        stock: 7,
        imageUrl: '',
      );

      final entity = model.toEntity();

      expect(entity.id, 'p2');
      expect(entity.title, 'Desk Lamp');
      expect(entity.price, 799);
      expect(entity.stock, 7);
      expect(entity.imageUrl, '');
    });
  });
}
