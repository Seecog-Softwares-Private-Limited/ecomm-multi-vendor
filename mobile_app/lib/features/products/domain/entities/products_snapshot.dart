import 'product.dart';

class ProductsSnapshot {
  const ProductsSnapshot({
    required this.products,
    this.isFromCache = false,
    this.isOffline = false,
  });

  final List<Product> products;
  final bool isFromCache;
  final bool isOffline;
}
