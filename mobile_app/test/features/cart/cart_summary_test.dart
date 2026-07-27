import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/cart/domain/entities/cart_item.dart';
import 'package:indovyapar_customer/features/cart/presentation/cart_controller.dart';

CartItem _item({
  required String id,
  required double price,
  required double mrp,
  int qty = 1,
  double? gst,
}) {
  return CartItem(
    id: id,
    productId: 'p$id',
    quantity: qty,
    product: CartProduct(
      id: 'p$id',
      name: 'Product $id',
      sellingPrice: price,
      mrp: mrp,
      gstPercent: gst,
      stock: 10,
    ),
  );
}

void main() {
  group('CartItem getters', () {
    test('lineTotal multiplies selling price by quantity', () {
      expect(_item(id: '1', price: 100, mrp: 120, qty: 3).lineTotal, 300);
    });

    test('lineSavings uses mrp difference and never goes negative', () {
      expect(_item(id: '1', price: 100, mrp: 120, qty: 2).lineSavings, 40);
      expect(_item(id: '2', price: 120, mrp: 100, qty: 2).lineSavings, 0);
    });
  });

  group('CartState.summary', () {
    test('empty cart has zero totals and no shipping', () {
      const state = CartState();
      final s = state.summary;
      expect(s.subtotal, 0);
      expect(s.tax, 0);
      expect(s.shipping, 0);
      expect(s.total, 0);
    });

    test('free shipping while delivery fee is disabled', () {
      final state = CartState(items: [_item(id: '1', price: 100, mrp: 100, gst: 0)]);
      final s = state.summary;
      expect(s.subtotal, 100);
      expect(s.shipping, 0);
      expect(s.total, 100);
    });

    test('waives shipping at or above the threshold', () {
      final state = CartState(items: [_item(id: '1', price: 500, mrp: 500, gst: 0)]);
      expect(state.summary.shipping, 0);
    });

    test('applies default GST when product gst is null', () {
      final state = CartState(items: [_item(id: '1', price: 1000, mrp: 1000)]);
      expect(state.summary.tax, closeTo(1000 * kDefaultGstPercent / 100, 0.0001));
    });

    test('aggregates savings and quantity across items', () {
      final state = CartState(items: [
        _item(id: '1', price: 100, mrp: 150, qty: 2, gst: 0),
        _item(id: '2', price: 200, mrp: 250, gst: 0),
      ]);
      final s = state.summary;
      expect(state.totalQuantity, 3);
      expect(s.savings, 150);
      expect(s.subtotal, 400);
    });
  });
}
