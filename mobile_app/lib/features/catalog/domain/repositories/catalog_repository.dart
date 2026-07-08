import '../entities/category.dart';
import '../entities/product.dart';

/// Backend-supported curated product feeds.
enum MenuType {
  deals('deals'),
  newArrivals('new-arrivals'),
  bestSellers('best-sellers');

  const MenuType(this.slug);
  final String slug;
}

abstract interface class CatalogRepository {
  Future<List<Product>> fetchProducts({
    String? categorySlug,
    String? subCategorySlug,
    String? query,
    MenuType? menuType,
    int limit,
    int offset,
  });

  Future<ProductDetail> fetchProduct(String idOrSlug);

  Future<List<Review>> fetchReviews(String id, {int limit});

  Future<List<Category>> fetchCategories();

  Future<List<CategoryTree>> fetchCategoryTree();
}
