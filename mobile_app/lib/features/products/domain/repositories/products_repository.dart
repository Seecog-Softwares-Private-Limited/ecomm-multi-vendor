import '../entities/products_snapshot.dart';

abstract interface class ProductsRepository {
  Future<ProductsSnapshot> fetchProducts({int page = 1, int limit = 20});
}
