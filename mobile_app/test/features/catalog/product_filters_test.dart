import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/catalog/domain/entities/product.dart';
import 'package:indovyapar_customer/features/catalog/presentation/product_filters.dart';

Product _p(String id, double price, {double rating = 0, double? oldPrice}) =>
    Product(id: id, name: 'P$id', price: price, rating: rating, oldPrice: oldPrice, slug: 's$id');

void main() {
  final products = <Product>[
    _p('1', 100, rating: 4.5, oldPrice: 200), // 50% off
    _p('2', 50, rating: 3.0),
    _p('3', 300, rating: 5.0, oldPrice: 330), // ~9% off
    _p('4', 150, rating: 4.0),
  ];

  test('default filters are inactive and preserve order', () {
    const filters = ProductFilters();
    expect(filters.isActive, isFalse);
    expect(filters.activeCount, 0);
    expect(filters.apply(products).map((p) => p.id), ['1', '2', '3', '4']);
  });

  test('price range filters inclusive bounds', () {
    const filters = ProductFilters(minPrice: 100, maxPrice: 200);
    final ids = filters.apply(products).map((p) => p.id).toList();
    expect(ids, containsAll(<String>['1', '4']));
    expect(ids, isNot(contains('2')));
    expect(ids, isNot(contains('3')));
  });

  test('minimum rating filters low-rated products', () {
    const filters = ProductFilters(minRating: 4.0);
    final ids = filters.apply(products).map((p) => p.id).toList();
    expect(ids, ['1', '3', '4']);
  });

  test('sorts price low to high', () {
    const filters = ProductFilters(sort: ProductSort.priceLowToHigh);
    expect(filters.apply(products).map((p) => p.id), ['2', '1', '4', '3']);
  });

  test('sorts by discount descending', () {
    const filters = ProductFilters(sort: ProductSort.discount);
    expect(filters.apply(products).first.id, '1');
  });

  test('activeCount aggregates independent groups', () {
    const filters = ProductFilters(minPrice: 10, minRating: 4, sort: ProductSort.rating);
    expect(filters.activeCount, 3);
  });
}
