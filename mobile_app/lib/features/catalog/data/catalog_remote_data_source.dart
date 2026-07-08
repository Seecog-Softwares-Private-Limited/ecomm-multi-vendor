import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

/// Read access to the public catalog endpoints (`/api/products`,
/// `/api/categories`, reviews).
class CatalogRemoteDataSource {
  CatalogRemoteDataSource(this._client);

  final DioClient _client;

  Future<List<dynamic>> getProducts({
    String? categorySlug,
    String? subCategorySlug,
    String? q,
    String? menuType,
    int limit = 20,
    int offset = 0,
  }) async {
    final data = await _client.get(ApiEndpoints.products, query: {
      'categorySlug': ?categorySlug,
      'subCategorySlug': ?subCategorySlug,
      if (q != null && q.trim().isNotEmpty) 'q': q.trim(),
      'menuType': ?menuType,
      'limit': limit,
      'offset': offset,
    });
    return (data as List?) ?? const [];
  }

  Future<Map<String, dynamic>> getProduct(String idOrSlug) async {
    final data = await _client.get(ApiEndpoints.productById(idOrSlug));
    return Map<String, dynamic>.from(data as Map);
  }

  Future<List<dynamic>> getReviews(String id, {int limit = 20}) async {
    final data = await _client.get(ApiEndpoints.productReviews(id), query: {'limit': limit});
    return (data as List?) ?? const [];
  }

  Future<List<dynamic>> getCategories({bool tree = false}) async {
    final data = await _client.get(
      ApiEndpoints.categories,
      query: tree ? {'tree': '1'} : null,
    );
    return (data as List?) ?? const [];
  }
}
