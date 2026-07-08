import '../domain/entities/category.dart';
import '../domain/entities/product.dart';
import '../domain/repositories/catalog_repository.dart';
import 'catalog_remote_data_source.dart';

class CatalogRepositoryImpl implements CatalogRepository {
  CatalogRepositoryImpl(this._remote);

  final CatalogRemoteDataSource _remote;

  List<T> _mapList<T>(List<dynamic> raw, T Function(Map<String, dynamic>) fromJson) {
    return raw
        .whereType<Map>()
        .map((e) => fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  @override
  Future<List<Product>> fetchProducts({
    String? categorySlug,
    String? subCategorySlug,
    String? query,
    MenuType? menuType,
    int limit = 20,
    int offset = 0,
  }) async {
    final raw = await _remote.getProducts(
      categorySlug: categorySlug,
      subCategorySlug: subCategorySlug,
      q: query,
      menuType: menuType?.slug,
      limit: limit,
      offset: offset,
    );
    return _mapList(raw, Product.fromJson);
  }

  @override
  Future<ProductDetail> fetchProduct(String idOrSlug) async {
    final json = await _remote.getProduct(idOrSlug);
    return ProductDetail.fromJson(json);
  }

  @override
  Future<List<Review>> fetchReviews(String id, {int limit = 20}) async {
    final raw = await _remote.getReviews(id, limit: limit);
    return _mapList(raw, Review.fromJson);
  }

  @override
  Future<List<Category>> fetchCategories() async {
    final raw = await _remote.getCategories();
    return _mapList(raw, Category.fromJson);
  }

  @override
  Future<List<CategoryTree>> fetchCategoryTree() async {
    final raw = await _remote.getCategories(tree: true);
    return _mapList(raw, CategoryTree.fromJson);
  }
}
