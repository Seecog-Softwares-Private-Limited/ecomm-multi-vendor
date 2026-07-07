import '../entities/products_snapshot.dart';
import '../repositories/products_repository.dart';

class GetProductsUseCase {
  const GetProductsUseCase(this._repository);

  final ProductsRepository _repository;

  Future<ProductsSnapshot> call({int page = 1, int limit = 20}) {
    return _repository.fetchProducts(page: page, limit: limit);
  }
}
