import '../domain/entities/product.dart';

enum ProductSort {
  relevance('Relevance'),
  priceLowToHigh('Price: Low to High'),
  priceHighToLow('Price: High to Low'),
  rating('Customer Rating'),
  discount('Discount');

  const ProductSort(this.label);
  final String label;
}

/// Client-side filter + sort applied to already-fetched product pages.
class ProductFilters {
  const ProductFilters({
    this.minPrice,
    this.maxPrice,
    this.minRating = 0,
    this.sort = ProductSort.relevance,
  });

  final double? minPrice;
  final double? maxPrice;
  final double minRating;
  final ProductSort sort;

  bool get isActive =>
      minPrice != null || maxPrice != null || minRating > 0 || sort != ProductSort.relevance;

  int get activeCount {
    var count = 0;
    if (minPrice != null || maxPrice != null) count++;
    if (minRating > 0) count++;
    if (sort != ProductSort.relevance) count++;
    return count;
  }

  ProductFilters copyWith({
    double? minPrice,
    double? maxPrice,
    double? minRating,
    ProductSort? sort,
    bool clearPrice = false,
  }) {
    return ProductFilters(
      minPrice: clearPrice ? null : (minPrice ?? this.minPrice),
      maxPrice: clearPrice ? null : (maxPrice ?? this.maxPrice),
      minRating: minRating ?? this.minRating,
      sort: sort ?? this.sort,
    );
  }

  List<Product> apply(List<Product> input) {
    var result = input.where((p) {
      if (minPrice != null && p.price < minPrice!) return false;
      if (maxPrice != null && p.price > maxPrice!) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      return true;
    }).toList();

    switch (sort) {
      case ProductSort.priceLowToHigh:
        result.sort((a, b) => a.price.compareTo(b.price));
      case ProductSort.priceHighToLow:
        result.sort((a, b) => b.price.compareTo(a.price));
      case ProductSort.rating:
        result.sort((a, b) => b.rating.compareTo(a.rating));
      case ProductSort.discount:
        result.sort((a, b) => b.discountPercent.compareTo(a.discountPercent));
      case ProductSort.relevance:
        break;
    }
    return result;
  }
}
