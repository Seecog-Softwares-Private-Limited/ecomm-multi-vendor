import '../../../../core/storage/cache_keys.dart';
import '../../../../core/storage/hive_database.dart';
import '../models/product_model.dart';

class ProductsLocalDataSource {
  Future<void> saveProducts(List<ProductModel> products) async {
    final box = await HiveDatabase.productsBox();
    await box.put(
      CacheKeys.productsList,
      products.map((product) => product.toMap()).toList(),
    );
    await box.put(
      CacheKeys.productsUpdatedAt,
      DateTime.now().toIso8601String(),
    );
  }

  Future<List<ProductModel>?> readProducts() async {
    final box = await HiveDatabase.productsBox();
    final raw = box.get(CacheKeys.productsList);
    if (raw is! List<dynamic>) {
      return null;
    }

    return raw
        .whereType<Map>()
        .map((item) => ProductModel.fromMap(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<DateTime?> readLastUpdatedAt() async {
    final box = await HiveDatabase.productsBox();
    final raw = box.get(CacheKeys.productsUpdatedAt);
    if (raw is! String) {
      return null;
    }
    return DateTime.tryParse(raw);
  }

  Future<void> clearProducts() async {
    final box = await HiveDatabase.productsBox();
    await box.delete(CacheKeys.productsList);
    await box.delete(CacheKeys.productsUpdatedAt);
  }
}
