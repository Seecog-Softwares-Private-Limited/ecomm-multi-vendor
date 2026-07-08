import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/catalog_remote_data_source.dart';
import '../data/catalog_repository_impl.dart';
import '../domain/entities/category.dart';
import '../domain/entities/product.dart';
import '../domain/repositories/catalog_repository.dart';

final catalogRemoteDataSourceProvider = Provider<CatalogRemoteDataSource>(
  (ref) => CatalogRemoteDataSource(ref.read(dioClientProvider)),
);

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => CatalogRepositoryImpl(ref.read(catalogRemoteDataSourceProvider)),
);

final categoriesProvider = FutureProvider<List<Category>>(
  (ref) => ref.read(catalogRepositoryProvider).fetchCategories(),
);

final categoryTreeProvider = FutureProvider<List<CategoryTree>>(
  (ref) => ref.read(catalogRepositoryProvider).fetchCategoryTree(),
);

/// A named home feed backed by a curated backend menu type (or the general list).
final homeFeedProvider = FutureProvider.autoDispose.family<List<Product>, MenuType?>(
  (ref, menuType) =>
      ref.read(catalogRepositoryProvider).fetchProducts(menuType: menuType, limit: 12),
);

final productDetailProvider = FutureProvider.autoDispose.family<ProductDetail, String>(
  (ref, idOrSlug) => ref.read(catalogRepositoryProvider).fetchProduct(idOrSlug),
);

final productReviewsProvider = FutureProvider.autoDispose.family<List<Review>, String>(
  (ref, id) => ref.read(catalogRepositoryProvider).fetchReviews(id),
);

/// Related products for a PDP (same-ish feed for now; backend has no related API).
final relatedProductsProvider = FutureProvider.autoDispose.family<List<Product>, String>(
  (ref, id) =>
      ref.read(catalogRepositoryProvider).fetchProducts(menuType: MenuType.bestSellers, limit: 10),
);
