import 'package:dio/dio.dart';

import '../../../../core/network/connectivity_service.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/products_snapshot.dart';
import '../../domain/repositories/products_repository.dart';
import '../datasources/products_local_data_source.dart';
import '../datasources/products_remote_data_source.dart';

class ProductsRepositoryImpl implements ProductsRepository {
  ProductsRepositoryImpl({
    required ProductsRemoteDataSource remoteDataSource,
    required ProductsLocalDataSource localDataSource,
    required ConnectivityService connectivityService,
  }) : _remoteDataSource = remoteDataSource,
       _localDataSource = localDataSource,
       _connectivityService = connectivityService;

  final ProductsRemoteDataSource _remoteDataSource;
  final ProductsLocalDataSource _localDataSource;
  final ConnectivityService _connectivityService;

  @override
  Future<ProductsSnapshot> fetchProducts({int page = 1, int limit = 20}) async {
    final isOnline = await _connectivityService.isOnline;

    if (isOnline) {
      try {
        final remoteProducts = await _remoteDataSource.fetchProducts(
          page: page,
          limit: limit,
        );
        if (remoteProducts.isNotEmpty) {
          await _localDataSource.saveProducts(remoteProducts);
          return ProductsSnapshot(
            products: remoteProducts.map((item) => item.toEntity()).toList(),
          );
        }
      } on DioException {
        final cached = await _readCachedSnapshot(isOffline: false);
        if (cached != null) {
          return cached;
        }
      }
    } else {
      final cached = await _readCachedSnapshot(isOffline: true);
      if (cached != null) {
        return cached;
      }
    }

    return ProductsSnapshot(
      products: _fallbackProducts(page: page, limit: limit),
      isOffline: !isOnline,
    );
  }

  Future<ProductsSnapshot?> _readCachedSnapshot({required bool isOffline}) async {
    final cachedProducts = await _localDataSource.readProducts();
    if (cachedProducts == null || cachedProducts.isEmpty) {
      return null;
    }

    return ProductsSnapshot(
      products: cachedProducts.map((item) => item.toEntity()).toList(),
      isFromCache: true,
      isOffline: isOffline,
    );
  }

  List<Product> _fallbackProducts({required int page, required int limit}) {
    final start = (page - 1) * limit;
    return List.generate(limit, (index) {
      final idNumber = start + index + 1;
      return Product(
        id: 'p$idNumber',
        title: 'Sample Product $idNumber',
        price: 499 + (idNumber * 17).toDouble(),
        stock: 5 + (idNumber % 17),
        imageUrl: '',
      );
    });
  }
}
