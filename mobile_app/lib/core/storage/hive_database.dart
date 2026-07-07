import 'package:hive_flutter/hive_flutter.dart';

import 'cache_keys.dart';

abstract final class HiveDatabase {
  static Future<void> init() async {
    await Hive.initFlutter();
  }

  static Future<Box<dynamic>> openBox(String name) async {
    if (Hive.isBoxOpen(name)) {
      return Hive.box<dynamic>(name);
    }
    return Hive.openBox<dynamic>(name);
  }

  static Future<Box<dynamic>> productsBox() => openBox(CacheKeys.productsBox);
}
