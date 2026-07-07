import 'package:dio/dio.dart';

import '../../../../core/network/api_response_parser.dart';
import '../models/product_model.dart';

class ProductsRemoteDataSource {
  ProductsRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<ProductModel>> fetchProducts({
    required int page,
    required int limit,
  }) async {
    final offset = (page - 1) * limit;
    final response = await _dio.get<Map<String, dynamic>>(
      '/api/products',
      queryParameters: {'limit': limit, 'offset': offset},
    );
    final data = ApiResponseParser.unwrapData(response);
    final rawItems = (data['items'] as List<dynamic>?) ??
        (response.data?['data'] as List<dynamic>?) ??
        const [];

    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(ProductModel.fromMap)
        .toList();
  }
}
